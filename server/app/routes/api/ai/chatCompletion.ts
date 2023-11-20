import { Router } from "express";
import Joi from "joi";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.js";
import openai from "../../../config/openai.js";
import { authenticateToken } from "../../../middleware/auth.middleware.js";
import vectorStore from "../../../config/vectorStore.js";

const requestSchema = Joi.object({
  messages: Joi.array().required(),
  did: Joi.string().required(),
  recordId: Joi.string().optional(),
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
 *               did:
 *                 type: string
 *               recordId:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *     tags:
 *       - AI
 */
export default Router({ mergeParams: true }).post(
  "/ai/chatCompletion",
  // authenticateToken,
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

      const { did, recordId } = req.body;

      // Extract the messages array from the request body
      let messages: ChatCompletionMessageParam[] = [...req.body.messages];

      // Get the last message from the array and use it to search for more context
      const lastMessage = messages[messages.length - 1].content;

      // Create the filter to use for the retriever
      let filter: any = {
        did,
      };
      if (recordId) {
        filter = {
          $and: [
            {
              did: did,
            },
            {
              recordId: recordId,
            },
          ],
        };
      }

      // Seach vector storage for more context
      const docs = await vectorStore.similaritySearch(
        lastMessage!.toString(),
        10,
        filter
      );

      // Convert the docs into context, stringifying the content
      let context = docs
        .map((doc) => {
          return doc.pageContent.toString();
        })
        .toString();

      context = `Use this context to help you with your question: ${context}`;
      console.log("context", context);

      // Update the last message with the provided context and then the users message
      messages[messages.length - 1].content = context + lastMessage;

      const stream = await openai.chat.completions.create({
        model: "openhermes-2.5-mistral-7b",
        messages,
        stream: true,
        temperature: 0,
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
