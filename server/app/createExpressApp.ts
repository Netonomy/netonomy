import express, { Express } from "express";
import type { ErrorRequestHandler } from "express";
import myRouter from "./routes/createRouter.js";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import glob from "glob";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cors from "cors";
import loadEnv from "../loadEnv.js";
loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app: Express = express();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Netonomy API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: glob
    .sync("**/*.js", { cwd: `${__dirname}/routes/api/` })
    .map((filename) => "dist/app/routes/api/" + filename), // files containing annotations as above
};

const swaggerDocs = swaggerJsDoc(options);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {};

app.use(errorHandler);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const router = await myRouter();
app.use("/api", router);

export default app;
