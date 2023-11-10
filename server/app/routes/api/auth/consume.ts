import { Router } from "express";
import { challengeStore } from "./requestChallenge.js";

/**
 * @swagger
 * /api/auth/consume:
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
 *               challenge:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *     tags:
 *       - Auth
 */
export default Router({ mergeParams: true }).post(
  "/auth/consume",
  async (req, res) => {
    try {
      const { challenge } = req.body;
      if (!challenge) throw new Error("No challenge provided");

      // Check if the challenge exists and is not expired
      if (
        !challengeStore[challenge] ||
        challengeStore[challenge] < Date.now()
      ) {
        throw new Error("Invalid challenge");
      }

      // Delete the challenge from the storej
      delete challengeStore[challenge];

      res.status(200).json({
        message: "Challenge accepted",
      });
    } catch (err) {
      console.error(err);

      return res.json({
        status: "FAILED",
        message: (err as any).message,
      });
    }
  }
);
