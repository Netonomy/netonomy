import { Router } from "express";
import Joi from "joi";
import chromaClient from "../../../config/chomaClient.js";
import { OpenAIEmbeddingFunction } from "chromadb";

const requestSchema = Joi.object({
  name: Joi.string().required(),
});

/**
 * @swagger
 * /api/chroma/createCollection:
 *   post:
 *     description: Create a new collection
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *     tags:
 *       - Chroma
 */
export default Router({ mergeParams: true }).post(
  "/chroma/createCollection",
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

      let { name } = req.body;

      const embedder = new OpenAIEmbeddingFunction({
        openai_api_key: process.env.OPENAI_API_KEY!,
      });

      const collection = await chromaClient.createCollection({
        name,
      });

      if (!collection)
        return res.status(400).json({
          status: "FAILED",
          message: "Failed to create collection",
        });

      return res.json({
        status: "OK",
        message: "Collection created",
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
