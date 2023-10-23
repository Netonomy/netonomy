import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "http://ai-webserver:8000/v1",
  apiKey: "",
});

export default openai;
