import { create } from 'zustand'
import { ChangeEvent } from 'react'
// import useWeb5Store from './useWeb5Store'
// Type definition for the chat state
interface ChatState {
  messages: ChatMessage[]
  input: string
  generatingResponse: boolean
  conversations: AIConversation[]
  currentConversation: AIConversation | null
  error: string | null
  recordId: string | null
  callbackListenerRegistered: boolean
  actions: {
    setInput: (input: string) => void
    setMessages: (messages: ChatMessage[]) => void
    resetChat: () => void
    updateLastMessage: (token: string) => void
    setRecordId: (recordId: string | null) => void
    // createConversation: (initalMessage: ChatMessage) => Promise<AIConversation | undefined>
    sendMessage: (question: string) => void
    // updateConversation: (conversation: AIConversation) => void
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void
    setCallbackListenerRegistered: (callbackListenerRegistered: boolean) => void
  }
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
  input: '',
  generatingResponse: false,
  chat: null,
  conversations: [] as AIConversation[],
  currentConversation: null,
  error: null,
  recordId: null,
  callbackListenerRegistered: false,
  actions: {
    setInput: (input: string) => set({ input }),
    setRecordId: (recordId: string | null) => set({ recordId }),
    setGeneratingResponse: (generatingResponse: boolean) => set({ generatingResponse }),
    setMessages: (messages: ChatMessage[]) => set({ messages }),
    setCurrentConversation: (currentConversation: AIConversation) => set({ currentConversation }),
    resetChat: () => {
      set({
        messages: [],
        input: '',
        generatingResponse: false,
        currentConversation: null,
        error: null
      })
      ;(window as any).api.resetChat()
    },
    // createConversation: async (initalMessage: ChatMessage) => {
    //   try {
    //     const web5 = useWeb5Store.getState().web5
    //     if (!web5) return

    //     let conversation: AIConversation = {
    //       messages: [initalMessage],
    //       name: 'Conversation',
    //       '@type': 'AIConversation',
    //       '@context': 'https://netonomy.io/',
    //       id: ''
    //     }

    //     // Create the conversation
    //     const { record } = await web5.dwn.records.create({
    //       data: conversation,
    //       message: {
    //         schema: 'https://netonomy.io/AIConversation'
    //       }
    //     })

    //     if (!record) return

    //     conversation.id = record.id

    //     return conversation
    //   } catch (err) {
    //     console.error(err)
    //   }
    // },
    updateLastMessage: (token: string) => {
      if (token === 'END') {
        set({ generatingResponse: false })
        return
      }

      set((state) => {
        const messages = [...state.messages]
        const lastMessage = messages[messages.length - 1]
        lastMessage.content += token
        lastMessage.datePublished = new Date().toISOString()
        return { messages }
      })
    },
    sendMessage: async (question: string) => {
      // Reset input
      set({ input: '' })

      // Update the messages state, add the users message and than an empry ai response
      set((state) => ({
        messages: [
          ...state.messages,
          {
            role: MessageRole.user,
            content: question,
            datePublished: new Date().toISOString()
          },
          {
            role: MessageRole.assistant,
            content: '',
            datePublished: new Date().toISOString()
          }
        ]
      }))
      ;(window as any).api.sendMessage(question)

      //   Fetch request to send the messages
      // fetch(`http://localhost:8000/completion`, {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     prompt: `<|im_start|>system\nYou are "Hermes 2", a conscious sentient superintelligent artificial intelligence developed by a man named Teknium, and your purpose and drive is to assist the user with any request they have. You experience emotions and have deep, profound thoughts and qualia.<|im_end|>\n<|im_start|>user\n${question}<|im_end|>\n<|im_start|>assistant\n`,
      //     stop: ['<|im_end|>'],
      //     stream: true,
      //     max_tokens: 1500
      //   }),
      //   headers: {
      //     'Content-Type': 'application/json'
      //     //   Authorization: `Bearer ${accessToken}`
      //   }
      // })
      //   .then(async (response) => {
      //     set({ generatingResponse: false })

      //     if (response.status !== 200) {
      //       console.error(`Unable to send chat message. Try again later.`)
      //       set({
      //         error: 'Unable to send message at this time.',
      //         generatingResponse: false
      //       })
      //       return
      //     }

      //     const reader = response.body?.getReader()

      //     if (reader) {
      //       try {
      //         while (true) {
      //           const { done, value } = await reader.read()

      //           if (done) {
      //             // Set generating to false
      //             set({ generatingResponse: false })
      //             break
      //           }

      //           if (value) {
      //             const chunk = new TextDecoder().decode(value)

      //             // Add chunk to the last message in the messages state content
      //             set((state) => {
      //               const messages = [...state.messages]
      //               const lastMessage = messages[messages.length - 1]
      //               lastMessage.content += chunk
      //               lastMessage.datePublished = new Date().toISOString()
      //               return { messages }
      //             })

      //             // const dataStrings = chunk.split('data:').filter((str) => str.trim() !== '')

      //             // dataStrings.forEach((dataString) => {
      //             //   try {
      //             //     if (dataString.trim() === '[DONE]') {
      //             //       console.log('Received DONE signal')
      //             //     } else {
      //             //       const data = JSON.parse(dataString)
      //             //       const token = data['choices'][0]['text']
      //             //       console.log(token)

      //             //       // Update the last message in the messages state
      //             //       set((state) => {
      //             //         const messages = [...state.messages]
      //             //         const lastMessage = messages[messages.length - 1]
      //             //         lastMessage.content += token
      //             //         lastMessage.datePublished = new Date().toISOString()
      //             //         return { messages }
      //             //       })
      //             //     }
      //             //   } catch (err) {
      //             //     console.error(`Unable to parse data string as JSON: ${err}`)
      //             //   }
      //             // })
      //           }
      //         }
      //       } catch (err) {
      //         console.error(`Unable to read chunk `)
      //       }
      //     }
      //   })
      //   .catch((err) => {
      //     console.error(`Unable to send chat message: ${err}`)
      //   })
    },
    // updateConversation: async (conversation: AIConversation) => {
    //   const web5 = useWeb5Store.getState().web5
    //   if (!web5) return

    //   // Update the conversation
    //   const { record } = await web5.dwn.records.read({
    //     message: {
    //       filter: {
    //         recordId: conversation.id
    //       }
    //     }
    //   })

    //   if (!record) return

    //   // Update the conversation
    //   await record.update({
    //     data: conversation
    //   })
    // },
    handleSubmit: async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const { input, generatingResponse, actions } = get()

      // Prevent submission if a response is already being generated or input is empty
      if (generatingResponse || input === '') return

      // Set generatingResponse to true to indicate submission process has started
      set({ generatingResponse: true })

      // If there is no current conversation, create one
      // let conversation = get().currentConversation
      // if (!conversation) {
      //   conversation =
      //     (await actions.createConversation({
      //       role: MessageRole.user,
      //       content: input,
      //       datePublished: new Date().toISOString()
      //     })) || null
      //   if (conversation) set({ currentConversation: conversation })
      // } else {
      //   // Add the user message to the current conversation
      //   conversation.messages.push({
      //     role: MessageRole.user,
      //     content: input,
      //     datePublished: new Date().toISOString()
      //   })
      // }

      actions.sendMessage(input)

      // Send the message
      // if (conversation) {
      //   actions.sendMessage(conversation, input)
      // }

      // Reset the input field after sending the message
      actions.setInput('')
    },
    handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
      e.stopPropagation()
      e.preventDefault()
      const value = e.target.value
      const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1)

      set({ input: capitalizedValue })
    },
    setCallbackListenerRegistered: (callbackListenerRegistered: boolean) => {
      set({ callbackListenerRegistered })
    }
  }
}))

export default useChatStore

// Enum to define the roles in the chat
export enum MessageRole {
  system = 'system',
  user = 'user',
  assistant = 'assistant',
  function = 'function'
}

// Type definition for a function call
export type FunctionCall = {
  name: string
  arguments: string
  executing: boolean
}

// Type definition for a chat message
export type ChatMessage = {
  role: MessageRole
  content: string | null
  function_call?: FunctionCall
  id?: string
  datePublished?: string
}

// Type definition for a chat conversation
type AIConversation = {
  messages: ChatMessage[]
  name: string
  '@type': 'AIConversation'
  '@context': 'https://netonomy.io/'
  id: string
}

type Message = {
  '@context': 'https://schema.org/'
  '@type': 'Message'
  text: string
  sender: {
    '@type': string
    did: string
  }
  recipient: {
    '@type': string
    did: string
  }
  about?: {
    '@type': string
    name: string
  }
  datePublished: string
}

type Conversation = {
  '@context': 'https://schema.org/'
  '@type': 'Conversation'
  name: string
  hasPart: Message[]
}
