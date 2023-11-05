import { Router } from "express";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Calculator } from "langchain/tools/calculator";
import { ChatMessageHistory } from "langchain/memory";
import { AIMessage, SystemMessage, HumanMessage } from "langchain/schema";
import { BufferMemory } from "langchain/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { WebBrowser } from "langchain/tools/webbrowser";
import { ChainTool, SerpAPI } from "langchain/tools";
import { VectorDBQAChain } from "langchain/chains";

import Joi from "joi";
import vectorStore from "../../../config/vectorStore.js";

const schema = Joi.object({
  messageHistory: Joi.array().items(
    Joi.object({
      role: Joi.string().valid("system", "user", "ai"),
      content: Joi.string(),
    })
  ),
  input: Joi.string(),
  profile: Joi.any(),
  did: Joi.string().required(),
  recordId: Joi.string().optional(),
});

/**
 * @swagger
 * /api/ai/agent:
 *   post:
 *     description:
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: [ai, user, system]
 *                     content:
 *                       type: string
 *                     profile:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                     did:
 *                       type: string
 *                     recordId:
 *                       type: string
 *               input:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *     tags:
 *       - AI
 */
export default Router({ mergeParams: true }).post(
  "/ai/agent",
  async (req, res) => {
    try {
      // validate the request
      const validation = schema.validate(req.body);
      if (validation.error)
        return res.status(400).json({
          status: "ERROR",
          message: validation.error,
        });

      const { messageHistory, profile, did, recordId } = req.body;

      // Select model
      const model = new ChatOpenAI({
        temperature: 0,
        modelName: "gpt-4",
        streaming: true,
      });

      // Create the filter to use for the retriever
      let filter: any = {
        did,
      };
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

      const retriever = vectorStore.asRetriever({
        filter,
      });

      // Create chain for vector store
      const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
        returnSourceDocuments: true,
        metadata: filter,
      });
      const knowledgeBaseTool = new ChainTool({
        name: "knowledgeBase",
        description:
          "Knowledge Base - use this tool when you need to search your knowledge base for an answer. This hold all the information you have stored in your brain.",
        chain: chain,
      });

      // give the agent the tools it needs
      const embeddings = new OpenAIEmbeddings();
      const tools = [
        // new WebBrowser({ model, embeddings }),
        new Calculator(),
        knowledgeBaseTool,
        new SerpAPI(process.env.SERPAPI_API_KEY, {
          // currently not working , issue with langchain tool
          location: "Washington,DC,United States",
          hl: "en",
          gl: "us",
        }),
      ];

      // create the message history
      let pastMessages = messageHistory.map(
        (message: { role: MessageRole; content: string }) =>
          createMessage(message.role, message.content)
      );

      // Put in system prompt
      pastMessages = [
        createMessage(
          MessageRole.system,
          `You are the digital tertiary layer of ${
            profile.name
          }'s brain. You are the digital representation of ${
            profile.name
          }'s intelligence.
          If the user asks who or what you are, explain this to them.
          
          This is currently a chat with you and ${profile.name}.

          Here is their full profile:
          ${JSON.stringify(profile)}

          Be concise and to the point. Don't be too wordy. Don't be too short. Be just right.
          Always responsd with markdown formatted text.`
        ),
        ...pastMessages,
      ];

      // init executor
      const executor = await initializeAgentExecutorWithOptions(tools, model, {
        agentType: "chat-conversational-react-description",
        verbose: true,
        memory: new BufferMemory({
          returnMessages: true,
          memoryKey: "chat_history",
          chatHistory: new ChatMessageHistory(pastMessages),
        }),
      });

      // const executor = await PlanAndExecuteAgentExecutor.fromLLMAndTools({
      //   llm: model,
      //   tools,
      //   verbose: true,
      //   memory: new BufferMemory({
      //     returnMessages: true,
      //     memoryKey: "chat_history",
      //     chatHistory: new ChatMessageHistory(pastMessages),
      //   }),
      // });

      const { input } = req.body;

      const result = await executor.call({ input: input });

      res.json(result);
    } catch (err) {
      console.log(err);

      return res.status(400).json({
        status: "FAILED",
        message: err as any,
      });
    }
  }
);

enum MessageRole {
  system = "system",
  user = "user",
  ai = "ai",
}

function createMessage(role: MessageRole, content: string) {
  switch (role) {
    case "ai":
      return new AIMessage(content);
    case "system":
      return new SystemMessage(content);
    case "user":
      return new HumanMessage(content);
  }
}
