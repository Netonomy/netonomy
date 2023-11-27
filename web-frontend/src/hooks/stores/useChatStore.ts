import { create } from "zustand";
import useWeb5Store from "./useWeb5Store";
import useProfileStore from "./useProfileStore";
import { ChangeEvent } from "react";
import useAuthStore from "./useAuthStore";
import * as webllm from "@mlc-ai/web-llm";

// Type definition for the chat state
interface ChatState {
  messages: ChatMessage[];
  input: string;
  chat: webllm.ChatModule | null;
  generatingResponse: boolean;
  conversations: AIConversation[];
  currentConversation: AIConversation | null;
  error: string | null;
  recordId: string | null;
  actions: {
    loadChat: () => void;
    setInput: (input: string) => void;
    setMessages: (messages: ChatMessage[]) => void;
    resetChat: () => void;
    setRecordId: (recordId: string | null) => void;
    createConversation: (
      initalMessage: ChatMessage
    ) => Promise<AIConversation | undefined>;
    sendMessage: (conversation: AIConversation, question: string) => void;
    updateConversation: (conversation: AIConversation) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    handleInputChange: (
      e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
    ) => void;
  };
}

/**
 * Zustand store for managing chat state and actions.
 *
 * @property {ChatMessage[]} messages - Array of chat messages.
 * @property {string} input - Current input in the chat box.
 * @property {boolean} generatingResponse - Flag indicating if a response is being generated.
 * @property {AIConversation[]} conversations - Array of AI conversations.
 * @property {AIConversation | null} currentConversation - Current active AI conversation.
 * @property {string | null} recordId - ID of the current record.
 * @property {Object} actions - Object containing actions for manipulating the chat state.
 */
const useChatStore = create<ChatState>((set, get) => ({
  messages: [] as ChatMessage[],
  input: "",
  generatingResponse: false,
  chat: null,
  conversations: [] as AIConversation[],
  currentConversation: null,
  error: null,
  recordId: null,
  actions: {
    loadChat: async () => {
      try {
        console.log("loading chat");
        // create a ChatModule,
        const chat = new webllm.ChatModule();
        // This callback allows us to report initialization progress
        chat.setInitProgressCallback((report: webllm.InitProgressReport) => {
          console.log(report.progress);
        });
        // You can also try out "RedPajama-INCITE-Chat-3B-v1-q4f32_0"
        await chat.reload(
          "OpenHermes-2.5-Mistral-7B-q4f16_1",
          {},
          {
            model_lib_map: {
              "OpenHermes-2.5-Mistral-7B-q4f16_1":
                "https://raw.githubusercontent.com/Netonomy/netonomy/main/local-llm-binaries/OpenHermes-2.5-Mistral-7B-q4f16_1/OpenHermes-2.5-Mistral-7B-q4f16_1-webgpu.wasm",
            },
            model_list: [
              {
                model_url:
                  "https://huggingface.co/ademattos/open-hermes-2.5-f16/resolve/main/",
                local_id: "OpenHermes-2.5-Mistral-7B-q4f16_1",
                required_features: ["shader-f16"],
              },
            ],
          }
        );

        // Set the chat
        set({ chat });
      } catch (err) {
        console.error(err);
      }
    },
    setInput: (input: string) => set({ input }),
    setRecordId: (recordId: string | null) => set({ recordId }),
    setGeneratingResponse: (generatingResponse: boolean) =>
      set({ generatingResponse }),
    setMessages: (messages: ChatMessage[]) => set({ messages }),
    setCurrentConversation: (currentConversation: AIConversation) =>
      set({ currentConversation }),
    resetChat: () =>
      set({
        messages: [],
        input: "",
        generatingResponse: false,
        currentConversation: null,
        error: null,
      }),
    createConversation: async (initalMessage: ChatMessage) => {
      try {
        const web5 = useWeb5Store.getState().web5;
        if (!web5) return;

        let conversation: AIConversation = {
          messages: [initalMessage],
          name: "Conversation",
          "@type": "AIConversation",
          "@context": "https://netonomy.io/",
          id: "",
        };

        // Create the conversation
        const { record } = await web5.dwn.records.create({
          data: conversation,
          message: {
            schema: "https://netonomy.io/AIConversation",
          },
        });

        if (!record) return;

        conversation.id = record.id;

        return conversation;
      } catch (err) {
        console.error(err);
      }
    },
    sendMessage: async (conversation: AIConversation, question: string) => {
      // Reset input
      set({ input: "" });

      // Update conversation to have empty AI response
      let conversationWithEmptyAIResponse = {
        ...conversation,
        messages: [
          ...conversation.messages,
          {
            role: MessageRole.assistant,
            content: "",
          },
        ],
      };
      set({ currentConversation: conversationWithEmptyAIResponse });

      // Set generating to true
      set({ generatingResponse: true });

      const did = useWeb5Store.getState().did;
      const profile = useProfileStore.getState().profile;

      const accessToken = useAuthStore.getState().token;

      const generateProgressCallback = (_step: number, message: string) => {
        console.log(message);
      };

      console.log("GENERATING");
      const chat = get().chat;
      console.log(chat);
      if (!chat) return;

      const lastMessage =
        conversation.messages[conversation.messages.length - 1];
      console.log(lastMessage.content);
      const reply0 = await chat.generate(
        lastMessage.content!,
        generateProgressCallback
      );
      console.log(reply0);

      // Fetch request to send the messages
      // fetch(`${import.meta.env.VITE_API_URL}/ai/chatCompletion`, {
      //   method: "POST",
      //   body: JSON.stringify({
      //     messages: conversation.messages,
      //     did: did,
      //     recordId: get().recordId || undefined,
      //     profile,
      //   }),
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${accessToken}`,
      //   },
      // })
      //   .then(async (response) => {
      //     set({ generatingResponse: false });

      //     if (response.status !== 200) {
      //       console.error(`Unable to send chat message. Try again later.`);
      //       set({
      //         error: "Unable to send message at this time.",
      //         generatingResponse: false,
      //         currentConversation: conversation,
      //       });
      //       return;
      //     }

      //     const reader = response.body?.getReader();

      //     if (reader) {
      //       try {
      //         while (true) {
      //           const { done, value } = await reader.read();

      //           if (done) {
      //             // Set generating to false
      //             set({ generatingResponse: false });
      //             break;
      //           }

      //           if (value) {
      //             const chunk = new TextDecoder().decode(value);

      //             // Update AI message with new tokens
      //             set((state: any) => {
      //               // Create a copy of the current conversation
      //               let newConversation = { ...state.currentConversation };

      //               // Update the last message of the current conversation to have the new tokens from the server
      //               let lastMessageIndex = newConversation.messages!.length - 1;
      //               let lastMessage = {
      //                 ...newConversation.messages![lastMessageIndex],
      //               };
      //               lastMessage.content += chunk;

      //               // Update the conversation
      //               newConversation.messages![lastMessageIndex] = lastMessage;

      //               // Return the new state
      //               return {
      //                 ...state,
      //                 currentConversation: newConversation,
      //               };
      //             });
      //           }
      //         }
      //       } catch (err) {
      //         console.error(`Unable to read chunk `);
      //       }
      //     }
      //   })
      //   .catch((err) => {
      //     console.error(`Unable to send chat message: ${err}`);
      //   });

      // const accessToken = useAuthStore.getState().token;

      // const res = await api.post("/ai/agent", {
      //   messageHistory: [],
      //   input: question,
      //   did: did,
      //   recordId: get().recordId || undefined,
      //   profile: {
      //     name: profile?.name,
      //   },
      // });
      // Fetch request to send the messages
      // const res = await fetch(`http://localhost:3000/api/ai/agent`, {
      //   method: "POST",
      //   body: JSON.stringify({
      //     messageHistory: conversation.messages,
      //     input: question,
      //     did: did,
      //     recordId: get().recordId || undefined,
      //     profile: {
      //       name: profile?.name,
      //     },
      //   }),
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${accessToken}`,
      //   },
      // });
      // .then(async (response) => {
      //   set({ generatingResponse: false });

      //   const reader = response.body?.getReader();

      //   if (reader) {
      //     try {
      //       while (true) {
      //         const { done, value } = await reader.read();

      //         if (done) {
      //           // Set generating to false
      //           set({ generatingResponse: false });
      //           break;
      //         }

      //         if (value) {
      //           const chunk = new TextDecoder().decode(value);

      //           // Code for function calling

      //           // Split the chunk by '}' and filter out any empty strings
      //           const jsonStrings = chunk
      //             .split("}")
      //             .filter((str) => str.trim() !== "");

      //           jsonStrings.forEach((jsonString) => {
      //             // Try to parse each JSON string
      //             let json: {
      //               type: string;
      //               token?: string;
      //               name?: string;
      //               action?: string;
      //             };
      //             try {
      //               json = JSON.parse(jsonString + "}");
      //             } catch (err) {
      //               console.error(`Unable to parse chunk as JSON: ${err}`);
      //               return;
      //             }

      //             // If its type message then update the messages
      //             if (json.type === "message" && json.token !== undefined) {
      //               set({ generatingResponse: false });
      //               // extract the token
      //               const { token } = json;
      //               console.log(token);

      //               set((state: any) => {
      //                 // Create a copy of the current conversation
      //                 let newConversation = { ...state.currentConversation };

      //                 // Update the last message of the current conversation to have the new tokens from the server
      //                 let lastMessageIndex =
      //                   newConversation.messages!.length - 1;
      //                 let lastMessage = {
      //                   ...newConversation.messages![lastMessageIndex],
      //                 };
      //                 lastMessage.content += token;

      //                 // Update the conversation
      //                 newConversation.messages![lastMessageIndex] =
      //                   lastMessage;

      //                 // Return the new state
      //                 return {
      //                   ...state,
      //                   currentConversation: newConversation,
      //                 };
      //               });
      //             } else if (json.type === "agent_action") {
      //             } else if (json.type === "tool_end") {
      //             }
      //           });
      //         }
      //       }
      //     } catch (err) {
      //       console.error(`Unable to read chunk `);
      //     }
      //   }
      // })
      // .catch((err) => {
      //   console.error(`Unable to send chat message: ${err}`);
      // });

      // const repsonse = res.data.result;

      // // Update the conversation with the response
      // const conversationWithResponse = {
      //   ...conversation,
      //   messages: [
      //     ...conversation.messages,
      //     {
      //       role: MessageRole.assistant,
      //       content: repsonse,
      //     },
      //   ],
      // };
      // conversation = conversationWithResponse;
      // set({ currentConversation: conversationWithResponse });

      // get().actions.updateConversation(conversationWithResponse);

      // set({ generatingResponse: false });
    },
    updateConversation: async (conversation: AIConversation) => {
      const web5 = useWeb5Store.getState().web5;
      if (!web5) return;

      // Update the conversation
      const { record } = await web5.dwn.records.read({
        message: {
          filter: {
            recordId: conversation.id,
          },
        },
      });

      if (!record) return;

      // Update the conversation
      await record.update({
        data: conversation,
      });
    },
    handleSubmit: async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const { input, generatingResponse, actions } = get();

      console.log("SUBMITTING");

      // Prevent submission if a response is already being generated or input is empty
      if (generatingResponse || input === "") return;

      // Set generatingResponse to true to indicate submission process has started
      set({ generatingResponse: true });

      // If there is no current conversation, create one
      let conversation = get().currentConversation;
      if (!conversation) {
        conversation =
          (await actions.createConversation({
            role: MessageRole.user,
            content: input,
            datePublished: new Date().toISOString(),
          })) || null;
        if (conversation) set({ currentConversation: conversation });
      } else {
        // Add the user message to the current conversation
        conversation.messages.push({
          role: MessageRole.user,
          content: input,
          datePublished: new Date().toISOString(),
        });
      }

      // Send the message
      if (conversation) {
        actions.sendMessage(conversation, input);
      }

      // Reset the input field after sending the message
      actions.setInput("");
    },
    handleInputChange: (
      e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
    ) => {
      e.stopPropagation();
      e.preventDefault();
      const value = e.target.value;
      const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);

      set({ input: capitalizedValue });
    },
  },
}));

export default useChatStore;

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
  datePublished?: string;
};

// Type definition for a chat conversation
type AIConversation = {
  messages: ChatMessage[];
  name: string;
  "@type": "AIConversation";
  "@context": "https://netonomy.io/";
  id: string;
};

type Message = {
  "@context": "https://schema.org/";
  "@type": "Message";
  text: string;
  sender: {
    "@type": string;
    did: string;
  };
  recipient: {
    "@type": string;
    did: string;
  };
  about?: {
    "@type": string;
    name: string;
  };
  datePublished: string;
};

type Conversation = {
  "@context": "https://schema.org/";
  "@type": "Conversation";
  name: string;
  hasPart: Message[];
};
