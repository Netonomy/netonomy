import { Router } from "express";
import Joi from "joi";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.js";
import openai from "../../../config/openai.js";
import { authenticateToken } from "../../../middleware/auth.middleware.js";
import vectorStore from "../../../config/vectorStore.js";

const requestSchema = Joi.object({
  messages: Joi.array().required(),
  did: Joi.string().required(),
  recordId: Joi.string().optional(),
  profile: Joi.any(),
});

/**
 * @swagger
 * /api/ai/chatCompletion:
 *   post:
 *     description: Get types
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                     content:
 *                       type: string
 *               did:
 *                 type: string
 *               recordId:
 *                 type: string
 *               profile:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *     responses:
 *       200:
 *         description: OK
 *     tags:
 *       - AI
 */
export default Router({ mergeParams: true }).post(
  "/ai/chatCompletion",
  authenticateToken,
  async (req, res) => {
    try {
      // Validate the request body
      const { error } = requestSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: "FAILED",
          message: error.details[0].message,
        });
      }

      const { did, recordId, profile } = req.body;

      // Extract the messages array from the request body
      let messages: ChatCompletionMessageParam[] = [...req.body.messages];

      // Add a system message to the message array as the first message
      // messages.unshift({
      //   role: "system",
      //   content: `You are the digital tertiary layer of ${
      //     profile.name
      //   }'s brain. This means you are a digital representation of their brain.
      //     Don't act as if you are a robot. Be human. Be ${profile.name}.
      //     Answer questions as if you are ${profile.name}.
      //     ALWAYS ask questions back to the user to learn more about them.

      //     If the answer about them isn't in your digital brain then ask quesitons to learn more about them.

      //     This is currently a chat with you and ${profile.name}.

      //     You never need to say who you are, just act as if you are ${
      //       profile.name
      //     }. Unless you are specifically asked who you are, then explain you are a digital representation of ${
      //     profile.name
      //   }'s brain.

      //     Here is their full profile:
      //     ${JSON.stringify(profile)}

      //     Always responsd with markdown formatted text.`,
      // });

      // Get the last message from the array and use it to search for more context
      const lastMessage = messages[messages.length - 1].content;

      // Check if we need to query the vector storage for more context
      const retrievalNeededRes = await openai.chat.completions.create({
        model: "codellama-34b-instruct",
        messages: [
          {
            role: "user",
            content: `You are a system to analyze a message and deciede whether you need to query a vector database to retrieve more context or information. Output yes to retrieve more context or no to not retrieve more context. Only output 'yes' or 'no'. 
            
            MESSAGE: What are some of quinn's favorite things to do?

            OUTPUT: yes
            
            MESSAGE: ${lastMessage}
            
            OUTPUT: `,
          },
        ],
        temperature: 0,
      });

      const retrivalNeeded =
        retrievalNeededRes.choices[0].message.content === "yes";

      if (retrivalNeeded) {
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

        // Seach vector storage for more context
        const docs = await vectorStore.similaritySearch(
          lastMessage!.toString(),
          4,
          filter
        );

        // Convert the docs into context, stringifying the content
        let context = docs
          .map((doc) => {
            return doc.pageContent.toString();
          })
          .toString();

        context = `Use the following pieces of context to answer the question at the end.
      CONTEXT: ${context}
      
      QUESTION: ${lastMessage}`;

        console.log(context);

        // Update the last message with the provided context and then the users message
        messages[messages.length - 1].content = context;
      }

      const stream = await openai.chat.completions.create({
        model: "pplx-70b-chat-alpha",
        messages,
        stream: true,
        temperature: 0,
      });

      // Send the response back to the client
      for await (const part of stream) {
        res.write(part.choices[0]?.delta?.content || "");
      }

      res.end();
    } catch (err) {
      console.error(err);

      return res.status(400).json({
        status: "FAILED",
        message: err as any,
      });
    }
  }
);
