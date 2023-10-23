import { Fragment, useEffect, useRef } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { PlusIcon, SendIcon } from "lucide-react";
import useChat from "@/hooks/useChat";
import { Card, CardContent } from "./ui/card";

export function Chat() {
  const {
    messages,
    resetChat,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    generating,
  } = useChat();

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = async (event: any) => {
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      const caretPosition = event.target.selectionStart;
      const textBeforeCaret = input.substring(0, caretPosition);
      const textAfterCaret = input.substring(caretPosition);
      if (setInput) {
        setInput(textBeforeCaret + "\n" + textAfterCaret);
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (buttonRef.current) buttonRef.current.click();
    }
  };

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "24px";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
    }
  }, [input]);

  useEffect(() => {
    if (!generating && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [generating]);

  return (
    <Card className="relative flex flex-col items-center flex-1 w-full h-full rounded-xl">
      <CardContent className="h-full flex flex-col items-center w-full rounded-xl p-0">
        {/** Header */}
        <div className="absolute top-0 left-0 right-0 h-[55px] z-40 backdrop-blur-xl bg-[#fafafa]/30 dark:bg-[#0a0a0a]/30 ">
          <div className="h-full w-full flex items-center justify-between p-6">
            <div className="flex items-center gap-2 w-[80%] justify-center relative ">
              {messages.length > 1 && (
                <>
                  <img
                    src="/agent-ring-svg"
                    height={200}
                    width={200}
                    alt="agent-ring"
                    className="absolute top-0 left-0 right-0 bottom-0 m-auto"
                  />
                </>
              )}
            </div>

            <div className="w-[10%]">
              {messages.length > 1 && (
                <Button
                  onClick={async () => {
                    resetChat();
                  }}
                  size={"sm"}
                  variant={"ghost"}
                  className="rounded-full p-2"
                >
                  <PlusIcon />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/** Info Message when chat is empty */}
        {(messages.length === 1 || messages.length === 0) && (
          <div className="absolute flex flex-col items-center gap-4 w-[95%] p-4 justify-center h-[60%] z-30">
            <div className="flex flex-col gap-4 items-center">
              <div className="h-[300px] w-[200px]">
                <img
                  src="/agent.svg"
                  height={175}
                  width={175}
                  alt="agent-ring"
                  className="absolute top-0 left-0 right-0 bottom-0 m-auto"
                />
                <img
                  src="/agent-ring.svg"
                  height={175}
                  width={175}
                  alt="agent-ring"
                  className="absolute top-0 left-0 right-0 bottom-0 m-auto"
                />
              </div>

              <div className="gap-2 flex flex-col">
                <h2 className="text-3xl font-semibold tracking-tight text-center">
                  Chat with your AI Assistant
                </h2>

                <p className="text-sm text-muted-foreground text-center">
                  Begin typing to ask questions, gain insights, or simply chat.
                  Remember, the clearer your questions, the better the
                  responses.
                </p>
              </div>
            </div>
          </div>
        )}

        {/** Messages List */}
        <div className="flex flex-1 h flex-col items-center w-full  relative overflow-y-auto">
          <div className="flex flex-1 flex-col items-center w-full relative overflow-y-auto">
            <div className="h-full w-full p-4 flex overflow-y-auto flex-col-reverse z-30 pt-[60px]">
              {messages
                .slice()
                .reverse()
                .map((message, i) => (
                  <Fragment key={i}>
                    {message.role === "user" && (
                      <div
                        className={`my-2 p-3 rounded-xl inline-block bg-blue-500 text-white ml-auto whitespace-pre-wrap`}
                      >
                        {message.content}
                      </div>
                    )}
                    {message.role === "assistant" && (
                      <div
                        className={`my-2 p-3 rounded-2xl inline-block bg-secondary text-black mr-auto whitespace-pre-wrap ${
                          message.content === "" && "animate-bounce"
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

        {/** Input Form */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center relative h-auto p-2 w-full gap-2 border-t-[1.5px]  z-20"
        >
          <Textarea
            ref={textAreaRef}
            value={input}
            contentEditable
            role="textbox"
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="min-h-[50px] h-10 max-h-[250px] pt-[12px] mr-[47px] resize-none w-full text-md bg-secondary text-primary box-border"
          />

          <Button
            size="icon"
            className="p-2 absolute bottom-3 right-2"
            type="submit"
            ref={buttonRef}
          >
            <SendIcon className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
