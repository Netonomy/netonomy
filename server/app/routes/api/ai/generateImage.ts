import { Router } from "express";
import Joi from "joi";
import openai from "../../../config/openai.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const requestSchema = Joi.object({
  prompt: Joi.string().required(),
  file: Joi.any().required(),
}).unknown(true);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "files/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage, dest: "files/" });

/**
 * @swagger
 * /api/ai/genImage:
 *   post:
 *     description: Generate an image from a prompt
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 required: true
 *               prompt:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: OK
 *     tags:
 *       - AI
 */
export default Router({ mergeParams: true }).post(
  "/ai/genImage",
  upload.single("file"),
  async (req, res) => {
    try {
      // Validate the request body
      const { error } = requestSchema.validate({
        ...req.body,
        file: req.file,
      });
      if (error) {
        return res.status(400).json({
          status: "FAILED",
          message: error.details[0].message,
        });
      }

      let { prompt } = req.body;

      const file = req.file;

      const response = await openai.images.edit({
        image: fs.createReadStream(file!.path),
        prompt: prompt,
      });

      const imageUrl = response;

      res.json({ imageUrl });
    } catch (err) {
      console.error(err);

      return res.json({
        status: "FAILED",
        message: err as any,
      });
    }
  }
);
