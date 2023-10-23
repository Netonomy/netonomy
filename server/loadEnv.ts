import * as dotenv from "dotenv";
import fs from "fs";

function loadEnv() {
  // Always load the .env file
  dotenv.config();

  // If we're in development mode, load .env.development
  if (process.env.NODE_ENV === "development") {
    if (fs.existsSync(".env.development")) {
      dotenv.config({ path: ".env.development", override: true });
    }
  }

  // If we're in production mode, load .env.production
  if (process.env.NODE_ENV === "production") {
    if (fs.existsSync(".env.production")) {
      dotenv.config({ path: ".env.production", override: true });
    }
  }

  // Lastly, we load the .env.local file, if it exists
  if (fs.existsSync(".env.local")) {
    dotenv.config({ path: ".env.local", override: true });
  }
}

export default loadEnv;
