import { Router } from "express";
import Joi from "joi";
import openai from "../../../config/openai.js";

const requestSchema = Joi.object({
  prompt: Joi.string().required(),
});

/**
 * @swagger
 * /api/ai/completetion:
 *   post:
 *     description: Get types
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *     tags:
 *       - Ai
 */
export default Router({ mergeParams: true }).post(
  "/ai/completetion",
  async (req, res) => {
    try {
      // Validate the request body
      const { error } = requestSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: "FAILED",
          message: error.details[0].message,
        });
      }

      let { prompt } = req.body;
      prompt = `<s>[INST] ${prompt} [/INST]`;

      const stream = await openai.completions.create({
        model: "mistral-7",
        prompt,
        stream: true,
        stop: "</s>",
        max_tokens: 2000,
      });

      // Send the response back to the client
      for await (const part of stream) {
        res.write(part.choices[0]?.text || "");
      }

      res.end();
    } catch (err) {
      console.error(err);

      return res.json({
        status: "FAILED",
        message: err as any,
      });
    }
  }
);
