import { Router } from "express";
import { challengeStore } from "./requestChallenge.js";
import { server } from "@passwordless-id/webauthn";

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

      // Check if the challenge is still valid
      const challenge = challengeStore[did];
      if (!challenge) throw new Error("Invalid challenge");

      // Check if the challenge is not expired
      if (challenge.expirationDate < Date.now()) {
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

      // Delete the challenge from the store
      delete challengeStore[did];

      res.status(200).json({
        message: "Challenge accepted",
        registration: registrationParsed,
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
