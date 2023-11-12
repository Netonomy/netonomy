import { Router } from "express";
import { server } from "@passwordless-id/webauthn";
import pool from "../../../config/pgPool.js";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     description: Login
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               authentication:
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
  "/auth/login",
  async (req, res) => {
    try {
      const { authentication, did } = req.body;
      if (!authentication) throw new Error("No challenge provided");
      if (!did) throw new Error("No DID provided");

      // Obtain the credential id from the database by authentication.credentialId
      const credentialId = authentication.credentialId;
      const { rows } = await pool.query(
        "SELECT * FROM credentials WHERE credential_id = $1",
        [credentialId]
      );
      if (!rows.length) throw new Error("Credential not found");

      const credentialKey = rows[0].data;

      // Get the challenege from the database
      const { rows: challengeRows } = await pool.query(
        "SELECT * FROM challenges WHERE did = $1",
        [did]
      );
      if (!challengeRows.length) throw new Error("Challenge not found");

      const challenge = challengeRows[0].challenge;

      const expected = {
        challenge,
        origin: "http://localhost:4000",
        userVerified: true, // should be set if `userVerification` was set to `required` in the authentication options (default)
        counter: -1, // TODO: keep track of the counter in the database
      };

      await server.verifyAuthentication(
        authentication,
        credentialKey,
        expected
      );

      // Create access token for the user
      const accessToken = jwt.sign(
        {
          did,
        },
        process.env.TOKEN_SECRET as string
      );

      res.status(200).json({
        message: "Authentication successful",
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
