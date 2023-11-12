import { Router } from "express";
import crypto from "crypto";
import pool from "../../../config/pgPool.js";

// Helper function to generate a secure challenge
function generateChallenge() {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * @swagger
 * /api/auth/requestChallenge:
 *   post:
 *     description: Request a challenge
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               did:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *     tags:
 *       - Auth
 */
export default Router({ mergeParams: true }).post(
  "/auth/requestChallenge",
  async (req, res) => {
    try {
      const { did } = req.body;
      if (!did) throw new Error("No DID provided");

      // Check if the challenge exists in the database
      const { rows } = await pool.query(
        "SELECT * FROM challenges WHERE did = $1",
        [did]
      );
      if (rows.length > 0) {
        // Delete the challenge from the database
        await pool.query("DELETE FROM challenges WHERE did = $1", [did]);
      }

      // Generate a challenge
      const challenge = generateChallenge();

      // Store the challenge in the database, so we can verify it later
      await pool.query(
        "INSERT INTO challenges (did, challenge) VALUES ($1, $2)",
        [did, challenge]
      );

      // Check if the user exists in the database and join their credentials
      const { rows: userRows } = await pool.query(
        "SELECT users.*, credentials.* FROM users INNER JOIN credentials ON users.id = credentials.user_id WHERE users.did = $1",
        [did]
      );
      const credentialIds = userRows.map((row: any) => row.credential_id);

      res.json({
        challenge,
        credentialIds,
      });
    } catch (err) {
      console.error(err);

      return res.json({
        status: "FAILED",
        message: err as any,
      });
    }
  }
);
