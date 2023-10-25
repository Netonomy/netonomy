import { ChromaClient } from "chromadb";

const chromaClient = new ChromaClient({
  path: "http://vector-store:8000",
});

export default chromaClient;
