import { Router } from "express";
import Joi from "joi";
import vectorStore from "../../../config/vectorStore.js";

const requestSchema = Joi.object({
  searchString: Joi.string().required(),
  nResults: Joi.number().optional(),
  did: Joi.string().optional(),
  recordId: Joi.string().optional(),
});

/**
 * @swagger
 * /api/chroma/search:
 *   post:
 *     description: Similarity search
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               searchString:
 *                 type: string
 *               nResults:
 *                 type: number
 *               did:
 *                 type: string
 *               recordId:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *     tags:
 *       - Chroma
 */
export default Router({ mergeParams: true }).post(
  "/chroma/search",
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

      let { searchString, nResults, did, recordId } = req.body;
      nResults = nResults || 4;

      let filter = {};
      if (did) {
        filter = {
          did,
        };
      }
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

      const results = await vectorStore.similaritySearch(
        searchString,
        nResults,
        filter
      );

      return res.json(results);
    } catch (err) {
      console.error(err);

      return res.json({
        status: "FAILED",
        message: err as any,
      });
    }
  }
);
