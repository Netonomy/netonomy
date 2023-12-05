import { Button } from '@renderer/components/ui/button'
import { Textarea } from '@renderer/components/ui/textarea'
import useChatStore from '@renderer/hooks/stores/useChatStore'
import { AlertCircle, Loader2, PlusIcon, SendIcon } from 'lucide-react'
import { Fragment, useEffect, useRef } from 'react'
import aiImg from '../assets/aiSelf3.png'
import { Card, CardContent } from '@renderer/components/ui/card'

export default function ChatScreen() {
  const input = useChatStore((state) => state.input)
  const setInput = useChatStore((state) => state.actions.setInput)
  const generating = useChatStore((state) => state.generatingResponse)
  const messages = useChatStore((state) => state.messages)
  const handleSubmit = useChatStore((state) => state.actions.handleSubmit)
  const error = useChatStore((state) => state.error)
  const handleInputChange = useChatStore((state) => state.actions.handleInputChange)
  const resetChat = useChatStore((state) => state.actions.resetChat)
  const updateLastMessage = useChatStore((state) => state.actions.updateLastMessage)
  const callbackListenerRegistered = useChatStore((state) => state.callbackListenerRegistered)
  const setCallbackListenerRegistered = useChatStore(
    (state) => state.actions.setCallbackListenerRegistered
  )
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = async (event: any) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault()
      const caretPosition = event.target.selectionStart
      const textBeforeCaret = input.substring(0, caretPosition)
      const textAfterCaret = input.substring(caretPosition)
      if (setInput) {
        setInput(textBeforeCaret + '\n' + textAfterCaret)
        // Set cursor position after state update
        setTimeout(() => {
          if (textAreaRef.current) {
            textAreaRef.current.selectionStart = caretPosition + 1
            textAreaRef.current.selectionEnd = caretPosition + 1
          }
        }, 0)
      }
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (buttonRef.current) buttonRef.current.click()
    }
  }

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '24px'
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px'
    }
  }, [input])

  useEffect(() => {
    if (!callbackListenerRegistered) {
      // Define the callback inside useEffect to ensure it's using the latest state/props
      const callback = (_: any, message: string) => {
        updateLastMessage(message)
      }

      window.api.handleAiResponse(callback)

      setCallbackListenerRegistered(true)
    }
  }, [])

  return (
    <div className="h-full w-full flex flex-col items-center gap-4 row-span-5 col-span-1">
      <Card
        className="relative flex flex-col items-center flex-1 w-full h-full rounded-xl overflow-hidden shadow-lg"
        // onClick={() => navigate("/chat")}
      >
        <CardContent className="h-full flex flex-col items-center w-full rounded-xl p-0">
          {/** Header */}
          <div className="absolute top-0 left-0 right-0 h-[55px] z-40 backdrop-blur-xl bg-white dark:bg-[#0a0a0a]/30 ">
            <div className="h-full w-full flex items-center justify-between p-6">
              <div className="w-[10%]"></div>
              <div className="flex items-center gap-2 w-[80%] justify-center relative ">
                {messages.length > 0 && (
                  <div className="h-[45px] w-[45px] rounded-full overflow-hidden relative">
                    <img
                      src={aiImg}
                      height={45}
                      width={45}
                      alt="agent-ring"
                      className="absolute top-0 left-0 right-0 bottom-0 m-auto"
                    />
                  </div>
                )}
              </div>

              <div className="w-[10%]">
                {messages.length > 0 && (
                  <Button
                    onClick={async () => {
                      resetChat()
                    }}
                    size={'sm'}
                    variant={'ghost'}
                    className="rounded-full p-2"
                  >
                    <PlusIcon />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/** Info Message when chat is empty */}
          {messages.length === 0 && (
            <div className="absolute flex flex-col items-center gap-4 w-[95%] p-4 justify-center h-[80%] z-30">
              <div className="flex flex-col gap-4 items-center">
                <div className="h-[200px] w-[200px] rounded-full overflow-hidden relative">
                  <img src={aiImg} height={200} width={200} alt="agent-ring" />
                </div>

                <div className="gap-2 flex flex-col">
                  <h2 className="text-3xl font-semibold tracking-tight text-center">
                    Chat with your AI Assistant
                  </h2>

                  <p className="text-sm text-muted-foreground text-center">
                    Begin typing to ask questions, gain insights, or simply chat. Remember, the
                    clearer your questions, the better the responses.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/** Messages List */}
          <div className="flex flex-1 h flex-col items-center w-full relative overflow-y-auto max-h-[calc(100vh-115px)]">
            <div className="flex flex-1 flex-col items-center w-full relative overflow-y-auto">
              <div className="h-full w-full p-4 flex overflow-y-auto flex-col-reverse z-30 pt-[60px]">
                {error && (
                  <div
                    className={`my-2 p-3 rounded-2xl bg-red-500 text-secondary mr-auto max-w-[90%] whitespace-pre-wrap flex gap-1`}
                  >
                    <AlertCircle />
                    {error}
                  </div>
                )}

                {messages
                  .slice()
                  .reverse()
                  .map((message, i) => (
                    <Fragment key={i}>
                      {message.role === 'user' && (
                        <div
                          className={`my-2 p-3 rounded-xl inline-block bg-blue-500 text-white ml-auto whitespace-pre-wrap`}
                        >
                          {message.content}
                        </div>
                      )}
                      {message.role === 'assistant' && (
                        <div
                          className={`my-2 p-3 rounded-2xl inline-block bg-secondary text-primary dark:bg-primary dark:text-secondary mr-auto max-w-[90%] whitespace-pre-wrap ${
                            generating && message.content === '' && 'animate-bounce'
                          }`}
                        >
                          {message.content}
                        </div>
                      )}
                    </Fragment>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/** Input Form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center relative h-auto w-full gap-2 max-w-[700px] z-50"
      >
        <Textarea
          ref={textAreaRef}
          value={input}
          role="textbox"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={generating}
          placeholder="Ask anything..."
          className="min-h-[50px] h-10 max-h-[400px] pr-[58px] py-4 resize-none w-full text-md  text-primary box-border rounded-xl shadow-lg overflow-hidden"
        />

        <Button
          size="sm"
          className="p-2 absolute bottom-2 right-2 rounded-xl h-10 w-10"
          type="submit"
          disabled={generating || input === ''}
          ref={buttonRef}
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendIcon className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  )
}
