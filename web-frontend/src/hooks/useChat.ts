import Web5Context from "@/Web5Provider";
import { atom, useAtom } from "jotai";
import { ChangeEvent, FormEvent, useContext, useState } from "react";

// Enum to define the roles in the chat
export enum MessageRole {
  system = "system",
  user = "user",
  assistant = "assistant",
  function = "function",
}

// Type definition for a function call
export type FunctionCall = {
  name: string;
  arguments: string;
  executing: boolean;
};

// Type definition for a chat message
export type ChatMessage = {
  role: MessageRole;
  content: string | null;
  function_call?: FunctionCall;
  id?: string;
};

// Atoms for managing chat
const aiChatMessagesAtom = atom<ChatMessage[]>([]);
const inputAtom = atom<string>("");
export const contextStringAtom = atom<string | null>(null);
export const recordIdAtom = atom<string | null>(null); // Record Id if the file is currently being viewed

// Main hook function for managing chat
export default function useChat() {
  const [messages, setMessages] = useAtom(aiChatMessagesAtom); // State for messages
  const [input, setInput] = useAtom(inputAtom); // State for input
  const [generating, setGenerating] = useState(false); // State for when AI is generating response
  const [, setContext] = useAtom(contextStringAtom); // State for context
  const web5Context = useContext(Web5Context);
  const [recordId, setRecordId] = useAtom(recordIdAtom);

  // Function to reset the chat
  const resetChat = () => {
    setMessages([]);
  };

  // Function to send messages
  async function sendMessages(_messages: ChatMessage[], question: string) {
    // Reset input
    setInput("");

    // Update messages array to have empty ai message
    const messagesWithEmptyAiMsg: ChatMessage[] = [
      ..._messages,
      {
        role: MessageRole.assistant,
        content: "",
      },
    ];
    setMessages(messagesWithEmptyAiMsg); // Set the new messages

    // Set generating to true
    setGenerating(true);

    // Fetch request to send the messages
    fetch(`http://localhost:3000/api/ai/chains/retrievalQA`, {
      method: "POST",
      body: JSON.stringify({
        chatHistory: _messages,
        input: question,
        did: web5Context!.did,
        recordId: recordId || undefined,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        const reader = response.body?.getReader();

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                // Set generating to false
                setGenerating(false);
                break;
              }

              if (value) {
                const chunk = new TextDecoder().decode(value);

                // Update AI message with new tokens
                setMessages((prevMessages) => {
                  let updatedMessages = [...prevMessages];
                  let lastMessage = updatedMessages[updatedMessages.length - 1];
                  lastMessage.content += chunk;

                  return updatedMessages;
                });

                // Split the chunk by '}' and filter out any empty strings
                // const jsonStrings = chunk
                //   .split("}")
                //   .filter((str) => str.trim() !== "");

                // jsonStrings.forEach((jsonString) => {
                //   // Try to parse each JSON string
                //   let json: {
                //     type: string;
                //     token?: string;
                //     name?: string;
                //     id?: string;
                //   };
                //   try {
                //     json = JSON.parse(jsonString + "}");
                //   } catch (err) {
                //     console.error(`Unable to parse chunk as JSON: ${err}`);
                //     return;
                //   }

                //   // If its type message then update the messages
                //   if (json.type === "message" && json.token !== undefined) {
                //     // extract the token
                //     const { token } = json;

                //     // Update AI message with new tokens
                //     setMessages((prevMessages) => {
                //       let updatedMessages = [...prevMessages];
                //       let lastMessage =
                //         updatedMessages[updatedMessages.length - 1];
                //       lastMessage.content += token;

                //       return updatedMessages;
                //     });
                //   } else if (json.type === "function-call-start") {
                //     // Update the messages to know the function call is starting
                //     // Store a new message right before the last message in the array
                //     setMessages((prevMessages) => {
                //       let updatedMessages = [...prevMessages];
                //       let lastMessage =
                //         updatedMessages[updatedMessages.length - 1];
                //       updatedMessages.splice(updatedMessages.length - 1, 0, {
                //         role: MessageRole.function,
                //         id: json.id,
                //         content: null,
                //         function_call: {
                //           name: json.name!,
                //           arguments: "",
                //           executing: true,
                //         },
                //       });
                //       return updatedMessages;
                //     });
                //   } else if (json.type === "function-call-end") {
                //     // Get the index of the function call message by id
                //     // Set the function call message to not executing
                //     setMessages((prevMessages) => {
                //       let updatedMessages = [...prevMessages];
                //       let functionCallMessageIndex = updatedMessages.findIndex(
                //         (message) => message.id === json.id
                //       );
                //       updatedMessages[
                //         functionCallMessageIndex
                //       ].function_call!.executing = false;
                //       return updatedMessages;
                //     });
                //   }
                // });
              }
            }
          } catch (err) {
            console.error(`Unable to read chunk `);
          }
        }
      })
      .catch((err) => {
        console.error(`Unable to send chat message: ${err}`);
      });
  }

  // Function to handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // If there no user input then don't send messages
    if (input === "") return;

    // Update messages array to have users input
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        role: MessageRole.user,
        content: input,
      },
    ];

    sendMessages(newMessages, input); // Send the new messages
  };

  // Function to handle input change
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const value = e.target.value;
    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
    setInput(capitalizedValue);
  };

  // Return the state and handlers
  return {
    input,
    setInput,
    setMessages,
    resetChat,
    messages,
    handleInputChange,
    handleSubmit,
    sendMessages,
    generating,
    setContext,
    setRecordId,
  };
}
