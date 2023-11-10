import { Router } from "express";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.js";
import Joi from "joi";
import { v4 as uuid } from "uuid";
import { queryCollection } from "../chroma/queryCollection.js";
import openai from "../../../config/openai.js";

const functions = [
  {
    name: "queryVectorIndex",
    description: "Use this tool when you need to query information.",
    parameters: {
      type: "object",
      properties: {
        queryTexts: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "A list of query texts. Take the users question and generate a list of query texts. Each item in the list is a single word",
        },
        did: {
          type: "string",
          description: "The DID of the user.",
        },
        recordId: {
          type: "string",
          description: "The recordId of a specific document.",
        },
      },
      required: ["queryTexts", "did"],
    },
  },
];
const availableFunctions: any = {
  queryVectorIndex: queryCollection,
};

const requestSchema = Joi.object({
  messages: Joi.array().required(),
});

/**
 * @swagger
 * /api/ai/functionCalling:
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
 *     responses:
 *       200:
 *         description: OK
 *     tags:
 *       - AI
 */
export default Router({ mergeParams: true }).post(
  "/ai/functionCalling",
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

      // Extract the messages array from the request body
      let messages: ChatCompletionMessageParam[] = [
        //         {
        //           role: "system",
        //           content: `You are a helpful AI assistant that specializes in building operations and maintenance and follows ASHRAE guidelines.
        // Answer as concisely as possible. Be short and to the point.

        // Always provide a source for your answers in markdown format inline with your response. Like this: [source](https://www.google.com).`,
        //         },
        ...req.body.messages,
      ];

      console.log(messages);

      // Send the messages to GPT
      const stream = await openai.chat.completions.create({
        model: "gpt-4-0613",
        messages,
        temperature: 0,
        stream: true,
        functions,
        function_call: "auto",
      });

      let functionArgsString = ""; // Accumulate function arguments
      let functionName = ""; // Store the function name when it's provided

      // Loop through the stream of messages from GPT
      for await (const part of stream) {
        // Check if the message is a function call
        const isFunctionCall = part.choices[0].delta.function_call;

        // If it's a function call, store the function name and arguments
        if (isFunctionCall) {
          // Store the function name when it's provided
          if (isFunctionCall.name) {
            functionName = isFunctionCall.name;
          }
          // If no function name is stored, continue to the next part of the stream
          if (!functionName) continue;

          // Accumulate function arguments
          if (isFunctionCall.arguments) {
            functionArgsString += isFunctionCall.arguments;
          }

          // Check if the function arguments string is a valid JSON
          try {
            const functionArgs = JSON.parse(functionArgsString);
            const functionToCall = availableFunctions[functionName];

            console.log("Funcation call");
            console.log(functionArgs);
            const functionCallId = uuid();
            // Tell the client that the function call is being processed
            res.write(
              JSON.stringify({
                type: "function-call-start",
                name: functionName,
                id: functionCallId,
              })
            );
            console.log("Function Starting");

            console.log(functionArgs);

            const functionResponse = await functionToCall(functionArgs);

            console.log("Function Response");
            console.log(functionResponse);

            console.log(JSON.stringify(functionResponse.results.documents));

            const responseMessage: ChatCompletionMessageParam = {
              role: "assistant",
              content: null,
              function_call: {
                name: functionName,
                arguments: functionArgsString,
              },
            };

            messages.push(responseMessage); // Add the initial response message to the messages array
            // Send the info on the function call and function response to GPT
            messages.push({
              role: "function",
              name: functionName,
              content: JSON.stringify(functionResponse.results.documents),
            });

            const secondResponse = await openai.chat.completions.create({
              model: "gpt-4",
              temperature: 0,
              messages,
              stream: true,
            });

            // Tell the client that the function call is done
            res.write(
              JSON.stringify({
                type: "function-call-end",
                name: functionName,
                id: functionCallId,
              })
            );

            // Send the response message back to the client
            for await (const part of secondResponse) {
              res.write(
                JSON.stringify({
                  type: "message",
                  token: part.choices[0]?.delta?.content,
                })
              );
            }

            // Reset functionArgsString and functionName for the next function call
            functionArgsString = "";
            functionName = "";
          } catch (error) {
            // If it's not a valid JSON, continue accumulating the string
            continue;
          }
        } else {
          // Send the response message back to the client
          res.write(
            JSON.stringify({
              type: "message",
              token: part.choices[0]?.delta?.content,
            })
          );
        }
      }

      res.end();
    } catch (err) {
      console.log(err);

      return res.json({
        status: "FAILED",
        message: err as any,
      });
    }
  }
);
