import { Router } from "express";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import multer from "multer";
import fs from "fs";
import path from "path";
import Joi from "joi";
import vectorStore from "../../../config/vectorStore.js";
import { authenticateToken } from "../../../middleware/auth.middleware.js";

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

const schema = Joi.object({
  did: Joi.string().required(),
  recordId: Joi.string().optional(),
}).unknown(true);

/**
 * @swagger
 * /api/chroma/uploadFile:
 *   post:
 *     description: Upload a file to the chroma collection
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
 *               did:
 *                 type: string
 *                 required: true
 *               recordId:
 *                  type: string
 *     responses:
 *       200:
 *         description: OK
 *     tags:
 *       - Chroma
 */
export default Router({ mergeParams: true }).post(
  "/chroma/uploadFile",
  upload.single("file"),
  authenticateToken,
  async (req, res) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: "FAILED",
          message: error.details[0].message,
        });
      }

      const file = req.file; // Extracting file from the request

      // If no file is found in the request, return a 400 status code with a message
      if (!file) return res.status(400).json({ message: "No file" });

      const { did, recordId } = req.body;
      let filter: any = {
        did,
      };
      if (recordId) {
        filter = {
          ...filter,
          recordId,
        };
      }

      if (file.mimetype === "application/pdf") {
        const loader = new PDFLoader(file.path);

        let docs = await loader.load();
        docs = docs.map((doc) => {
          doc.metadata = {
            ...doc.metadata,
            ...filter,
          };
          return doc;
        });

        await vectorStore.addDocuments(docs);

        fs.unlink(file.path, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });

        return res.json({
          status: "OK",
          message: "Documents added to collection",
        });
      } else {
        return res.status(400).json({
          status: "FAILED",
          message: "Invalid file type",
        });
      }
    } catch (err) {
      console.error(err);

      return res.json({
        status: "FAILED",
        message: err as any,
      });
    }
  }
);
