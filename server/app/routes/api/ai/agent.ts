import { Router } from "express";
import {
  AgentExecutor,
  initializeAgentExecutorWithOptions,
} from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Calculator } from "langchain/tools/calculator";
import { ChatMessageHistory } from "langchain/memory";
import { AIMessage, SystemMessage, HumanMessage } from "langchain/schema";
import { BufferMemory } from "langchain/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { WebBrowser } from "langchain/tools/webbrowser";
import {
  ChainTool,
  DynamicStructuredTool,
  DynamicTool,
  SerpAPI,
  formatToOpenAITool,
} from "langchain/tools";
import { VectorDBQAChain } from "langchain/chains";
import { getJson } from "serpapi";
import Joi from "joi";
import vectorStore from "../../../config/vectorStore.js";
import { loadYoutubeVideoToMemory } from "./loadYoutubeVideoToMemory.js";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { z } from "zod";
import axios from "axios";
import { Document } from "langchain/document";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { authenticateToken } from "../../../middleware/auth.middleware.js";
import { RunnableSequence } from "langchain/schema/runnable";
import { formatToOpenAIToolMessages } from "langchain/agents/format_scratchpad/openai_tools";
import {
  OpenAIToolsAgentOutputParser,
  type ToolsAgentStep,
} from "langchain/agents/openai/output_parser";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";

const schema = Joi.object({
  messageHistory: Joi.array().items(
    Joi.object({
      role: Joi.string().valid("system", "user", "ai", "assistant"),
      content: Joi.string(),
    }).unknown(true)
  ),
  input: Joi.string(),
  profile: Joi.any(),
  did: Joi.string().required(),
  recordId: Joi.string().optional(),
}).unknown(true);

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
 *               profile:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *               did:
 *                 type: string
 *               recordId:
 *                 type: string
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
  // authenticateToken,
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
        maxTokens: 100,
        // configuration: {
        //   baseURL: process.env.OPENAI_BASE_URL,
        //   apiKey: process.env.PERPLEXITY_API_KEY,
        // },
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

      // const retriever = vectorStore.asRetriever({
      //   // filter,
      //   metadata: filter,
      // });

      // Create chain for vector store
      const chain = VectorDBQAChain.fromLLM(model, vectorStore);
      const knowledgeBaseTool = new ChainTool({
        name: "brain-knowledge-base",
        description:
          "Brain Knowledge Base - use this tool to lookup info from your brain. This has all the information of the user's brain. (Documents, messages, photos, memories...)",
        chain: chain,
        verbose: false,
        metadata: filter,
      });

      const serp = new SerpAPI(process.env.SERPAPI_API_KEY, {
        // currently not working , issue with langchain tool
        location: "Washington,DC,United States",
        hl: "en",
        gl: "us",
      });

      const embeddings = new OpenAIEmbeddings();
      const browser = new WebBrowser({ model, embeddings });

      const customSearchTool = new DynamicStructuredTool({
        name: "internet-access",
        description:
          "Internet Access - use this tool when you need to search the internet for an answer.",
        schema: z.object({
          query: z
            .string()
            .describe("The search query to put into the web browser"),
          question: z
            .string()
            .describe("The question you want answered from the search query"),
        }),
        func: async ({ query, question }) => {
          try {
            // Get top links from serp api
            const res = await getJson({
              engine: "google",
              api_key: process.env.SERPAPI_API_KEY,
              q: query,
              location: "Austin, Texas",
            });

            // Get the top 4 links
            const topLinks = res.organic_results
              .slice(0, 1)
              .map((result: any) => result.link);

            let docs: Document[] = [];

            // Browse each link to try and find an answer
            for (const link of topLinks) {
              console.log(link);
              const loader = new CheerioWebBaseLoader(link);

              const newDocs = await loader.load();
              console.log(docs);

              // Add new docs to docs
              docs = [...docs, ...newDocs];
            }

            // Split the docs out into more docs, the pageContent property can't be too long
            docs = docs.flatMap((doc) => {
              const pageContent = doc.pageContent;
              const pageContentLength = pageContent.length;
              const maxPageContentLength = 10000;
              const maxPages = Math.ceil(
                pageContentLength / maxPageContentLength
              );

              const newDocs = [];
              for (let i = 0; i < maxPages; i++) {
                const start = i * maxPageContentLength;
                const end = (i + 1) * maxPageContentLength;
                const newDoc = {
                  ...doc,
                  pageContent: pageContent.substring(start, end),
                };
                newDocs.push(newDoc);
              }

              return newDocs;
            });

            // Load the docs into the vector store
            const vectorStore = await MemoryVectorStore.fromDocuments(
              docs,
              new OpenAIEmbeddings()
            );

            // Search the vector store for the input
            const searchResults = await vectorStore.similaritySearch(question);
            const toolResponse = JSON.stringify(searchResults);

            // Make sure the tool response is not too long
            // Trim it if it is too long, 100k max
            if (toolResponse.length > 100000) {
              return toolResponse.slice(0, 100000);
            }

            return JSON.stringify(searchResults);
          } catch (err) {
            console.log(err);
            return "Sorry, I could not find an answer to your question. Please try again.";
          }
        },
      });

      // Youtube watcher tool
      // This tool will watch a youtube video and return the transcript
      const youtubeWatcherTool = new DynamicStructuredTool({
        name: "youtube-watcher",
        description:
          "Youtube Watcher - use this tool when you need to watch a youtube video. The input should be the youtube video url and a question to ask the video.",
        schema: z.object({
          url: z.string().describe("The url of the youtube video"),
          question: z.string().describe("The question to ask the video"),
        }),
        func: async ({ question, url }) => {
          let docs = await loadYoutubeVideoToMemory(url, did);

          // Load the docs into the vector store
          const vectorStore = await MemoryVectorStore.fromDocuments(
            docs,
            new OpenAIEmbeddings()
          );

          docs = await vectorStore.similaritySearch(input);

          const str = JSON.stringify(docs);

          // Make sure the string is not too long
          // If it is too long, then cut it off
          if (str.length > 128000) {
            return str.slice(0, 128000);
          }

          return JSON.stringify(docs);
        },
      });

      // give the agent the tools it needs

      const tools = [
        // new WebBrowser({ model, embeddings }),
        // youtubeWatcherTool,
        new Calculator(),
        knowledgeBaseTool,
        new SerpAPI(process.env.SERPAPI_API_KEY, {
          // currently not working , issue with langchain tool
          location: "Washington,DC,United States",
          hl: "en",
          gl: "us",
        }),
        // customSearchTool,
      ];

      // Convert to OpenAI tool format
      const modelWithTools = model.bind({
        tools: tools.map(formatToOpenAITool),
      });

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
          }'s brain, this means you are a digital representation of ${
            profile.name
          }'s intelligence. If the user asks who or what you are, explain this to them. When the user asks a question, you should answer it as if you are ${
            profile.name
          }. Don't act as if you are a robot. Be human. Be ${profile.name}.
        Here is their full profile:
        ${JSON.stringify(profile)}
        Always reference your memory first, then the internet or other sources if needed.
        Today is ${new Date().toLocaleDateString()}
        This is currently a on  between you and ${profile.name}.
        
        You do have the capability to search the internet and provide real time info.
        
        Sometimes the user may be looking at a particular image or file, just search your memory based on what they ask.
        
        Be short and concise with your answers. Don't be too verbose. Less is more.`
        ),
        ...pastMessages,
      ];

      const prompt = ChatPromptTemplate.fromMessages([
        ["ai", "You are a helpful assistant"],
        ["human", "{input}"],
        new MessagesPlaceholder("agent_scratchpad"),
        new MessagesPlaceholder("chat_history"),
      ]);

      const memory = new BufferMemory({
        memoryKey: "history", // The object key to store the memory under
        inputKey: "question", // The object key for the input
        outputKey: "answer", // The object key for the output
        returnMessages: true,
        chatHistory: new ChatMessageHistory(pastMessages),
      });

      const runnableAgent = RunnableSequence.from([
        {
          input: (i: { input: string; steps: ToolsAgentStep[] }) => i.input,
          agent_scratchpad: (i: { input: string; steps: ToolsAgentStep[] }) =>
            formatToOpenAIToolMessages(i.steps),
          // Load memory here
          chat_history: async (_: {
            input: string;
            steps: ToolsAgentStep[];
          }) => {
            const { history } = await memory.loadMemoryVariables({});
            return history;
          },
        },
        prompt,
        modelWithTools,
        new OpenAIToolsAgentOutputParser(),
      ]).withConfig({ runName: "OpenAIToolsAgent" });

      // init executor
      const executor = AgentExecutor.fromAgentAndTools({
        agent: runnableAgent,
        tools,
        verbose: true,
      });

      const { input } = req.body;

      const result = await executor.invoke(
        { input }
        // {
        //   callbacks: [
        //     {
        //       handleAgentAction: (action, runId) => {
        //         console.log("handleAgentAction");
        //         console.log(action);
        //         console.log(runId);

        //         res.write(
        //           JSON.stringify({
        //             type: "agent_action",
        //             action,
        //           })
        //         );
        //       },

        //       handleToolEnd: (output, runId) => {
        //         console.log("tool end");
        //         console.log(output);
        //         console.log(runId);

        //         res.write(
        //           JSON.stringify({
        //             type: "tool_end",
        //             output,
        //           })
        //         );
        //       },

        //       handleLLMNewToken: (token) => {
        //         // console.log("handleLLMNewToken");
        //         // console.log(token);
        //         res.write(
        //           JSON.stringify({
        //             type: "message",
        //             token,
        //           })
        //         );
        //       },
        //       handleAgentEnd: (action) => {
        //         // console.log("handleAgentEnd");
        //         res.end();
        //       },
        //     },
        //   ],
        // }
      );

      return res.status(200).json({ result: result.output });
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
  assistant = "assistant",
}

function createMessage(role: MessageRole, content: string) {
  switch (role) {
    case "ai":
      return new AIMessage(content);
    case "assistant":
      return new AIMessage(content);
    case "system":
      return new SystemMessage(content);
    case "user":
      return new HumanMessage(content);
  }
}
