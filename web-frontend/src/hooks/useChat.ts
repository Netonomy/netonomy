import { atom, useAtom } from "jotai";
import { ChangeEvent, FormEvent, useState } from "react";

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

// Main hook function for managing chat
export default function useChat() {
  const [messages, setMessages] = useAtom(aiChatMessagesAtom); // State for messages
  const [input, setInput] = useAtom(inputAtom); // State for input
  const [generating, setGenerating] = useState(false); // State for when AI is generating response

  // Function to reset the chat
  const resetChat = () => {
    setMessages([]);
  };

  // Function to send messages
  async function sendMessages(_messages: ChatMessage[]) {
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
    fetch(`http://localhost:3000/api/ai/chatCompletion`, {
      method: "POST",
      body: JSON.stringify({
        messages: _messages,
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
    setMessages(newMessages); // Set the new messages

    sendMessages(newMessages); // Send the new messages
  };

  // Function to handle input change
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
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
  };
}
