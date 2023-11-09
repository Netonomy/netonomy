import { atom, useAtom } from "jotai";
import { ChangeEvent, FormEvent, useState } from "react";
import useProfileStore from "./stores/useProfileStore";
import useWeb5Store from "./stores/useWeb5Store";

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

// Atoms for managing chat
const aiChatMessagesAtom = atom<ChatMessage[]>([]);
const inputAtom = atom<string>("");
export const contextStringAtom = atom<string | null>(null);
export const recordIdAtom = atom<string | null>(null); // Record Id if the file is currently being viewed

export const aiConversationsAtom = atom<AIConversation[]>([]); // State for all conversations
export const currentConversationAtom = atom<AIConversation | null>(null); // State for current conversation
// Main hook function for managing chat
export default function useChat() {
  const [messages, setMessages] = useAtom(aiChatMessagesAtom); // State for messages
  const [input, setInput] = useAtom(inputAtom); // State for input
  const [generating, setGenerating] = useState(false); // State for when AI is generating response
  const [, setContext] = useAtom(contextStringAtom); // State for context
  const [recordId, setRecordId] = useAtom(recordIdAtom);
  const web5 = useWeb5Store((state) => state.web5);
  const did = useWeb5Store((state) => state.did);

  const [conversations, setConversations] = useAtom(aiConversationsAtom); // State for all conversations
  const [currentConversation, setCurrentConversation] = useAtom(
    currentConversationAtom
  ); // State for current conversation

  const profile = useProfileStore((state) => state.profile);

  // Function to reset the chat
  const resetChat = () => {
    setCurrentConversation(null);
    setGenerating(false);
  };

  // Function to load a conversation
  async function loadConversations() {
    console.log("LOADING CONVERSATIONS");
    if (!web5) return;

    // Fetch the conversation
    const { records } = await web5.dwn.records.query({
      message: {
        filter: {
          schema: "https://netonomy.io/AIConversation",
        },
      },
    });

    // If there are no records then return
    if (!records) return;

    // Get the conversations
    let _conversations: AIConversation[] = [];
    for (let record of records) {
      let data = await record.data.json();

      data.id = record.id;

      console.log(JSON.stringify(data));

      _conversations.push(data);
    }

    setConversations(_conversations);
  }

  // Function to create a conversation with the first message
  async function createConversation(message: ChatMessage) {
    if (!web5) return;

    try {
      console.log("CREATING CONVERSATION");

      let conversation: AIConversation = {
        messages: [message],
        name: "Conversation",
        "@type": "AIConversation",
        "@context": "https://netonomy.io/",
        id: "",
      };

      console.log(conversation);

      // Create the conversation
      const { record } = await web5.dwn.records.create({
        data: conversation,
        message: {
          schema: "https://netonomy.io/AIConversation",
        },
      });

      console.log(record);

      if (!record) return;

      conversation.id = record.id;

      // Reset the current conversation
      return conversation;
    } catch (err) {
      console.error(err);
    }
  }

  // Update the current conversation
  async function updateConversation(_conversation: AIConversation) {
    if (!web5) return;

    // Update the conversation
    const { record } = await web5.dwn.records.read({
      message: {
        recordId: _conversation.id,
      },
    });

    if (!record) return;

    // Update the conversation
    await record.update({
      data: _conversation,
    });
  }

  // Function to send messages
  async function sendMessages(_conversation: AIConversation, question: string) {
    // Reset input
    setInput("");

    // Update conversation to have empty AI response
    const conversationWithEmptyAIResponse = {
      ..._conversation,
      messages: [
        ..._conversation.messages,
        {
          role: MessageRole.assistant,
          content: "",
        },
      ],
    };
    setCurrentConversation(conversationWithEmptyAIResponse);

    // Set generating to true
    setGenerating(true);

    // Fetch request to send the messages
    const res = await fetch(`http://localhost:3000/api/ai/agent`, {
      method: "POST",
      body: JSON.stringify({
        messageHistory: _conversation.messages,
        input: question,
        did: did,
        recordId: recordId || undefined,
        profile: {
          name: profile?.name,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();
    const repsonse = json.result;

    // Update the conversation with the response
    const conversationWithResponse = {
      ..._conversation,
      messages: [
        ..._conversation.messages,
        {
          role: MessageRole.assistant,
          content: repsonse,
        },
      ],
    };
    _conversation = conversationWithResponse;
    setCurrentConversation(conversationWithResponse);

    updateConversation(_conversation);
    setGenerating(false);

    // .then(async (response) => {
    //   const reader = response.body?.getReader();

    //   if (reader) {
    //     try {
    //       while (true) {
    //         const { done, value } = await reader.read();

    //         if (done) {
    //           // Set generating to false
    //           setGenerating(false);
    //           await updateConversation(_conversation);
    //           break;
    //         }

    //         if (value) {
    //           const chunk = new TextDecoder().decode(value);

    //           // Update Last AI message with new tokens
    //           setCurrentConversation((prevConversation) => {
    //             if (!prevConversation) return null;

    //             let updatedConversation = { ...prevConversation };
    //             let lastMessage =
    //               updatedConversation.messages[
    //                 updatedConversation.messages.length - 1
    //               ];
    //             lastMessage.content += chunk;
    //             lastMessage.datePublished = new Date().toISOString();

    //             _conversation = updatedConversation;

    //             return updatedConversation;
    //           });

    //           // Split the chunk by '}' and filter out any empty strings
    //           // const jsonStrings = chunk
    //           //   .split("}")
    //           //   .filter((str) => str.trim() !== "");

    //           // jsonStrings.forEach((jsonString) => {
    //           //   // Try to parse each JSON string
    //           //   let json: {
    //           //     type: string;
    //           //     token?: string;
    //           //     name?: string;
    //           //     id?: string;
    //           //   };
    //           //   try {
    //           //     json = JSON.parse(jsonString + "}");
    //           //   } catch (err) {
    //           //     console.error(`Unable to parse chunk as JSON: ${err}`);
    //           //     return;
    //           //   }

    //           //   // If its type message then update the messages
    //           //   if (json.type === "message" && json.token !== undefined) {
    //           //     // extract the token
    //           //     const { token } = json;

    //           //     // Update AI message with new tokens
    //           //     setMessages((prevMessages) => {
    //           //       let updatedMessages = [...prevMessages];
    //           //       let lastMessage =
    //           //         updatedMessages[updatedMessages.length - 1];
    //           //       lastMessage.content += token;

    //           //       return updatedMessages;
    //           //     });
    //           //   } else if (json.type === "function-call-start") {
    //           //     // Update the messages to know the function call is starting
    //           //     // Store a new message right before the last message in the array
    //           //     setMessages((prevMessages) => {
    //           //       let updatedMessages = [...prevMessages];
    //           //       let lastMessage =
    //           //         updatedMessages[updatedMessages.length - 1];
    //           //       updatedMessages.splice(updatedMessages.length - 1, 0, {
    //           //         role: MessageRole.function,
    //           //         id: json.id,
    //           //         content: null,
    //           //         function_call: {
    //           //           name: json.name!,
    //           //           arguments: "",
    //           //           executing: true,
    //           //         },
    //           //       });
    //           //       return updatedMessages;
    //           //     });
    //           //   } else if (json.type === "function-call-end") {
    //           //     // Get the index of the function call message by id
    //           //     // Set the function call message to not executing
    //           //     setMessages((prevMessages) => {
    //           //       let updatedMessages = [...prevMessages];
    //           //       let functionCallMessageIndex = updatedMessages.findIndex(
    //           //         (message) => message.id === json.id
    //           //       );
    //           //       updatedMessages[
    //           //         functionCallMessageIndex
    //           //       ].function_call!.executing = false;
    //           //       return updatedMessages;
    //           //     });
    //           //   }
    //           // });
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
  }

  // Function to handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // If there no user input then don't send messages
    if (input === "") return;

    // If there is no current conversation then create one
    let conversation;
    if (!currentConversation) {
      conversation = await createConversation({
        role: MessageRole.user,
        content: input,
        datePublished: new Date().toISOString(),
      });
      if (conversation) setCurrentConversation(conversation);
    } else {
      // Add the user message to the current conversation
      conversation = currentConversation;
      conversation.messages.push({
        role: MessageRole.user,
        content: input,
        datePublished: new Date().toISOString(),
      });
      setCurrentConversation(conversation);
    }

    // Send the messages
    sendMessages(conversation!, input); // Send the new messages
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

  // useEffect(() => {
  //   loadConversations();
  // }, []);

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
    loadConversations,
    currentConversation,
    conversations,
  };
}

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
