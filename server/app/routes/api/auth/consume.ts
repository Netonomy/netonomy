import { Router } from "express";
import pool from "../../../config/pgPool.js";

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

      // Check if the challenge exists in the database
      const { rows } = await pool.query(
        "SELECT * FROM challenges WHERE challenge = $1",
        [challenge]
      );

      if (!rows.length) throw new Error("Challenge not found");

      // Delete the challenge from the database
      await pool.query("DELETE FROM challenges WHERE challenge = $1", [
        challenge,
      ]);

      res.status(200).json({
        message: "Challenge consumed successfully",
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
