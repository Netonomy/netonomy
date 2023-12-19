import { create } from "zustand";
import { Message } from "../types/Message";

interface ChatStore {
  messages: Message[];
  listeningForTokens: boolean;
  generatingTokens: boolean;
  actions: {
    addMessage: (message: Message) => void;
    updateLastMessage: (newToken: string) => void;
    setListeningForTokens: (listening: boolean) => void;
    setGeneratingTokens: (generating: boolean) => void;
  };
}

const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  listeningForTokens: false,
  generatingTokens: false,
  actions: {
    addMessage: (message: Message) => {
      set({ messages: [...get().messages, message] });
    },
    updateLastMessage: (newToken: string) => {
      const messages = get().messages;
      const lastMessage = messages[messages.length - 1];
      lastMessage.content += newToken;
      set({ messages: [...messages] });
    },
    setListeningForTokens: (listening: boolean) =>
      set({ listeningForTokens: listening }),
    setGeneratingTokens: (generating: boolean) =>
      set({ generatingTokens: generating }),
  },
}));

export default useChatStore;
