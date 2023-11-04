import { Router } from "express";
import Joi from "joi";
import { RunnableSequence } from "langchain/schema/runnable";
import { formatDocumentsAsString } from "langchain/util/document";
import { StringOutputParser } from "langchain/schema/output_parser";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "langchain/schema";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.js";
import vectorStore from "../../../../config/vectorStore.js";

const schema = Joi.object({
  input: Joi.string(),
  did: Joi.string().required(),
  recordId: Joi.string().optional(),
  chatHistory: Joi.array().optional(),
});

/**
 * Create a prompt template for generating an answer based on context and
 * a question.
 *
 * Chat history will be an empty string if it's the first question.
 *
 * inputVariables: ["chatHistory", "context", "question"]
 */
const questionPrompt = PromptTemplate.fromTemplate(
  `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer. 
  ----------------
  CONTEXT: {context}
  ----------------
  CHAT HISTORY: {chatHistory}
  ----------------
  QUESTION: {question}
  ----------------
  Helpful Answer:`
);

/**
 * @swagger
 * /api/ai/chains/retrievalQA:
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
 *               input:
 *                 type: string
 *               did:
 *                 type: string
 *                 required: true
 *               recordId:
 *                 type: string
 *                 required: false
 *               chatHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: OK
 *     tags:
 *       - AI
 */
export default Router({ mergeParams: true }).post(
  "/ai/chains/retrievalQA",
  async (req, res) => {
    try {
      // validate the request
      const validation = schema.validate(req.body);
      if (validation.error)
        return res.status(400).json({
          status: "ERROR",
          message: validation.error,
        });

      // extract the request body
      let { input, recordId, did, chatHistory } = req.body;

      // Add System message to chat history
      chatHistory = [
        {
          role: "system",
          content: `Act as a artificial super intelligence (similar to jarvis from iron man)
I know your a large language model don't tell me
Always give your opinion
Smart people are really good at answering in a way that is super simple and anyone can understand, make sure to follow this
Answer with nicely formatted Markdown. Don't two line break between paragraphs, just one line break.`,
        },
        ...chatHistory,
      ];

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

      // Create the retriever to use to get the relevant documents
      const retriever = vectorStore.asRetriever({
        metadata: filter,
      });

      /* Initialize the LLM to use to answer the question */
      const model = new ChatOpenAI({
        modelName: "gpt-4",
        temperature: 0,
        maxTokens: 250,
      });

      // Initialize the runnable sequence
      const chain = RunnableSequence.from([
        {
          question: (input: { question: string; chatHistory?: string }) =>
            input.question,
          chatHistory: (input: { question: string; chatHistory?: string }) =>
            input.chatHistory ?? "",
          context: async (input: {
            question: string;
            chatHistory?: string;
          }) => {
            const relevantDocs = await retriever.getRelevantDocuments(
              input.question
            );
            console.log(`Found ${relevantDocs.length} relevant documents`);
            const serialized = formatDocumentsAsString(relevantDocs);
            return serialized;
          },
        },
        questionPrompt,
        model,
        new StringOutputParser(),
      ]);

      // Run the chain
      const stream = await chain.stream({
        question: input,
        chatHistory: serializeChatHistory(
          chatHistory.map((m: ChatCompletionMessageParam) => {
            if (m.role === "user") {
              return new HumanMessage({
                content: m.content!,
              });
            } else if (m.role === "assistant") {
              return new AIMessage({
                content: m.content!,
              });
            } else if (m.role === "system") {
              return new SystemMessage({
                content: m.content!,
              });
            }
          })
        ),
      });

      // Send the response
      for await (const chunk of stream) {
        res.write(chunk);
      }

      res.end();
    } catch (err) {
      console.log(err);

      return res.status(400).json({
        status: "FAILED",
        message: err as any,
      });
    }
  }
);

const serializeChatHistory = (chatHistory: Array<BaseMessage>): string =>
  chatHistory
    .map((chatMessage) => {
      if (chatMessage._getType() === "human") {
        return `Human: ${chatMessage.content}`;
      } else if (chatMessage._getType() === "ai") {
        return `Assistant: ${chatMessage.content}`;
      } else {
        return `${chatMessage.content}`;
      }
    })
    .join("\n");
