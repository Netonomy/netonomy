import { Router } from "express";
import { server } from "@passwordless-id/webauthn";
import pool from "../../../config/pgPool.js";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     description: Verify a challenge
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               registration:
 *                 type: object
 *               did:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *     tags:
 *       - Auth
 */
export default Router({ mergeParams: true }).post(
  "/auth/verify",
  async (req, res) => {
    try {
      const { registration, did } = req.body;
      if (!registration) throw new Error("No challenge provided");
      if (!did) throw new Error("No DID provided");

      // Fetch the challenge from the database
      const { rows } = await pool.query(
        "SELECT * FROM challenges WHERE did = $1",
        [did]
      );

      // Check if the challenge exists in the database
      if (!rows.length) throw new Error("Challenge not found");

      // Check if the challenge is still valid
      const challenge = rows[0];
      const expirationDate = challenge.expirationDate;

      // Check if the challenge is not expired
      if (expirationDate < Date.now()) {
        throw new Error("Challenge expired");
      }

      // Verify the challenge
      const expected = {
        challenge: challenge.challenge,
        origin: "http://localhost:4000",
      };

      const registrationParsed = await server.verifyRegistration(
        registration,
        expected
      );
      const credentialKey = registrationParsed.credential;
      const credentialId = credentialKey.id;

      // Delete the challenge from the store
      await pool.query("DELETE FROM challenges WHERE did = $1", [did]);

      // Create a new user in the database
      await pool.query("INSERT INTO users (did) VALUES ($1)", [did]);

      // Get the id of the user
      const { rows: userRows } = await pool.query(
        "SELECT * FROM users WHERE did = $1",
        [did]
      );
      const userId = userRows[0].id;

      // Store the credential key in the database for the user
      await pool.query(
        "INSERT INTO credentials (user_id, credential_id, data) VALUES ($1, $2, $3)",
        [userId, credentialId, credentialKey]
      );

      // Create access token for the user
      const accessToken = jwt.sign(
        {
          did,
          userId,
        },
        process.env.TOKEN_SECRET as string
      );

      res.status(200).json({
        message: "Challenge accepted",
        token: accessToken,
      });
    } catch (err) {
      console.error(err);

      return res.status(400).json({
        status: "FAILED",
        message: (err as any).message,
      });
    }
  }
);
