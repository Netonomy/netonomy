import { Router } from "express";
import Joi from "joi";
import chromaClient from "../../../config/chomaClient.js";

const requestSchema = Joi.object({
  ids: Joi.array().required(),
  documents: Joi.array().required(),
  metadatas: Joi.array().required(),
  embeddings: Joi.array().required(),
  collectionName: Joi.string().required(),
});

/**
 * @swagger
 * /api/chroma/addToCollection:
 *   post:
 *     description: Add docs to a collection
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               documents:
 *                   type: array
 *                   items:
 *                     type: object
 *               metadatas:
 *                   type: array
 *                   items:
 *                     type: object
 *               embeddings:
 *                   type: array
 *                   items:
 *                     type: object
 *               collectionName:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *     tags:
 *       - Chroma
 */
export default Router({ mergeParams: true }).post(
  "/chroma/addToCollection",
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

      let { ids, documents, metadatas, collectionName, embeddings } = req.body;

      const collection = await chromaClient.getCollection({
        name: collectionName,
      });

      if (!collection)
        return res.status(400).json({
          status: "FAILED",
          message: "Collection not found",
        });

      const response = await collection.add({
        ids,
        documents,
        metadatas,
        embeddings,
      });

      if (response.error)
        return res.status(400).json({
          status: "FAILED",
          message: response.error,
        });

      return res.json({
        status: "OK",
        message: "Documents added to collection",
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
