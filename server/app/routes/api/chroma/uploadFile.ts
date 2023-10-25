import { Router } from "express";
import chromaClient from "../../../config/chomaClient.js";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import multer from "multer";
import openai from "../../../config/openai.js";

const upload = multer({ dest: "files/" });

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
 *               recordId:
 *                 type: string
 *                 required: true
 *               did:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: OK
 *     tags:
 *       - Chroma
 */
export default Router({ mergeParams: true }).post(
  "/chroma/uploadFile",
  upload.single("file"),
  async (req, res) => {
    try {
      const file = req.file; // Extracting file from the request

      // If no file is found in the request, return a 400 status code with a message
      if (!file) return res.status(400).json({ message: "No file" });

      // Extracting 'did' and 'recordId' from the request body
      const { did, recordId } = req.body;

      // If the file is a PDF, proceed with the following operations
      if (file.mimetype === "application/pdf") {
        // Create a new instance of PDFLoader with the file path
        const loader = new PDFLoader(file.path);

        // Load the documents from the PDF file
        let docs = await loader.load();

        const documents = docs.map((doc) => doc.pageContent);

        // Map through the documents and add metadata to each document
        const metadatas = docs.map(() => {
          return { did, recordId };
        });

        const ids = docs.map((doc, i) => i.toString());

        let embeddings: any = [];
        for (const doc of docs) {
          const embedding = await openai.embeddings.create({
            input: doc.pageContent,
            model: "text-embedding-ada-002",
          });
          embeddings.push(embedding.data[0].embedding);
        }

        const colleciton = await chromaClient.getCollection({
          name: "test2",
        });

        const response = await colleciton.add({
          documents,
          metadatas,
          ids,
          embeddings,
        });

        if (response.error) {
          console.error(response.error);
          return res.status(400).json({
            status: "FAILED",
            message: response.error,
          });
        }
      }

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
