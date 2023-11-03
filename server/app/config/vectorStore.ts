import { Chroma } from "langchain/vectorstores/chroma";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const embeddings = new OpenAIEmbeddings();
const vectorStore = new Chroma(embeddings, {
  collectionName: process.env.CRHOMA_COLLECTION_NAME,
  url: process.env.CHROMA_URL,
});

export default vectorStore;
