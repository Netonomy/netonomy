import { Router } from "express";
import Joi from "joi";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.js";
import openai from "../../../config/openai.js";

const requestSchema = Joi.object({
  messages: Joi.array().required(),
});

/**
 * @swagger
 * /api/ai/chatCompletion:
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
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: OK
 *     tags:
 *       - AI
 */
export default Router({ mergeParams: true }).post(
  "/ai/chatCompletion",
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

      // Extract the messages array from the request body
      let messages: ChatCompletionMessageParam[] = [...req.body.messages];

      const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        stream: true,
        temperature: 0,
        max_tokens: 2000,
      });

      // Send the response back to the client
      for await (const part of stream) {
        process.stdout.write(part.choices[0]?.delta?.content || "");
        res.write(part.choices[0]?.delta?.content || "");
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
