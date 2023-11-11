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

      const challenge = generateChallenge();

      // Store the challenge in the database, so we can verify it later
      await pool.query(
        "INSERT INTO challenges (did, challenge) VALUES ($1, $2)",
        [did, challenge]
      );

      res.json({
        challenge,
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
