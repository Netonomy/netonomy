import { Loader2, SendIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { useEffect, useRef } from "react";
import useChatStore from "@/stores/useChatStore";

export default function ChatInputForm() {
  const input = useChatStore((state) => state.input);
  const setInput = useChatStore((state) => state.actions.setInput);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const generating = useChatStore((state) => state.generatingTokens);
  const sendMessage = useChatStore((state) => state.actions.sendMessage);

  const handleKeyDown = async (event: any) => {
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      const caretPosition = event.target.selectionStart;
      const textBeforeCaret = input.substring(0, caretPosition);
      const textAfterCaret = input.substring(caretPosition);
      if (setInput) {
        setInput(textBeforeCaret + "\n" + textAfterCaret);
        // Set cursor position after state update
        setTimeout(() => {
          if (textAreaRef.current) {
            textAreaRef.current.selectionStart = caretPosition + 1;
            textAreaRef.current.selectionEnd = caretPosition + 1;
          }
        }, 0);
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        sendMessage();
      }}
      className="flex items-center relative h-auto w-[90%] gap-2  max-w-[700px] z-50"
    >
      <Textarea
        ref={textAreaRef}
        value={input}
        role="textbox"
        onChange={(e) => setInput(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        disabled={generating}
        placeholder="Ask anything..."
        className="min-h-[50px] h-10 max-h-[250px] pr-[58px] py-4 resize-none w-full text-md text-primary box-border focus:shadow-md overflow-hidden bg-[#dedede] border-none"
      />

      <Button
        size="sm"
        className="p-2 absolute bottom-2 right-2 h-10 w-10"
        type="submit"
        disabled={generating || input === ""}
        ref={buttonRef}
      >
        {generating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SendIcon className="w-4 h-4" />
        )}
      </Button>
    </form>
  );
}
