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
import { Document } from "langchain/document";

const schema = Joi.object({
  input: Joi.string(),
  did: Joi.string().required(),
  recordId: Joi.string().optional(),
  profile: Joi.any().required(),
  conversation: Joi.object({
    name: Joi.string().optional(),
    id: Joi.string().required(),
    "@context": Joi.string().optional(),
    "@type": Joi.string().optional(),
    messages: Joi.array().items(
      Joi.object({
        role: Joi.string().required(),
        content: Joi.string().required(),
        datePublished: Joi.string().optional(),
      })
    ),
  }),
}).unknown(true);

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
 *               profile:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *               conversation:
 *                 type: object
 *                 properties:
 *                   name: 
 *                     type: string
 *                   id: 
 *                     type: string
 *                   messages:                 
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         role:
 *                           type: string
 *                         content:
 *                           type: string

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
      const { error, value } = schema.validate(req.body);
      if (error)
        return res.status(400).json({
          status: "ERROR",
          message: error,
        });

      // extract the request body
      let { input, recordId, did, conversation, profile } = value;

      // Add System message to chat history
      let chatHistory: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: `You are the digital tertiary layer of ${
            profile.name
          }'s brain. You are the digital representation of ${
            profile.name
          }'s intelligence.
          If the user asks who or what you are, explain this to them.
          When the user asks a question, you should answer it as if you are ${
            profile.name
          }.
          Don't act as if you are a robot. Be human. Be ${profile.name}.
          
          This is currently a chat with you and ${profile.name}.

          Here is their full profile:
          ${JSON.stringify(profile)}

          Be concise and to the point. Don't be too wordy. Don't be too short. Be just right.
          Always responsd with markdown formatted text.`,
        },
        ...conversation.messages,
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
        filter: filter,
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

            return new SystemMessage({
              content: m.content!,
            });
          })
        ),
      });

      // Send the response
      let response = "";
      for await (const chunk of stream) {
        response += chunk;
        res.write(chunk);
      }

      // Vectorize the conversation
      // First delete the old conversation
      await vectorStore.delete({
        ids: [conversation.id],
      });

      const conversationDoc = new Document({
        pageContent: JSON.stringify(conversation.messages),
        metadata: {
          ...filter,
          "@type": "Conversation",
          id: conversation.id,
          name: conversation.name,
        },
      });

      // Then vectorize the conversation
      await vectorStore.addDocuments([conversationDoc], {
        ids: [conversation.id],
      });

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
