import useChatStore from "@/stores/useChatStore";
import { listen } from "@tauri-apps/api/event";
import { Bot } from "lucide-react";
import { useEffect, Fragment } from "react";

export default function MessagesList() {
  const listeningForTokens = useChatStore((state) => state.listeningForTokens);
  const setListeningForTokens = useChatStore(
    (state) => state.actions.setListeningForTokens
  );
  const updateLastMessage = useChatStore(
    (state) => state.actions.updateLastMessage
  );
  const messages = useChatStore((state) => state.messages);
  const generating = useChatStore((state) => state.generatingTokens);
  const setGenerating = useChatStore(
    (state) => state.actions.setGeneratingTokens
  );

  useEffect(() => {
    if (!listeningForTokens) {
      listen("token", (event) => {
        let token = event.payload as string;

        if (token !== "DONE") {
          updateLastMessage(token);
        } else {
          setGenerating(false);
        }
      });
      setListeningForTokens(true);
    }
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center w-full relative overflow-y-auto max-w-[1000px] max-h-[calc(100vh-100px)] pt-[60px]">
      <div className="h-full w-full p-4 flex overflow-y-auto flex-col-reverse z-30  ">
        {messages.length > 0 ? (
          messages
            .slice()
            .reverse()
            .map((message, i) => (
              <Fragment key={i}>
                {message.role === "user" && (
                  <div
                    className={`my-2 p-3 rounded-xl inline-block bg-primary border-2 border-input ml-auto whitespace-pre-wrap`}
                  >
                    {message.content}
                  </div>
                )}
                {message.role === "assistant" && (
                  <div
                    className={`my-2 p-3 rounded-2xl inline-block border-input border-2 mr-auto max-w-[90%] whitespace-pre-wrap ${
                      generating && message.content === "" && "animate-bounce"
                    }`}
                  >
                    {message.content}
                  </div>
                )}
              </Fragment>
            ))
        ) : (
          <div className=" flex flex-1 mb-20 flex-col items-center gap-4 w-[95%] p-4 justify-center">
            <div className="flex flex-col gap-8 items-center max-w-[600px]">
              <div className="h-[200px] w-[200px] rounded-full overflow-hidden relative">
                <Bot className="w-full h-full absolute top-0 left-0" />
              </div>

              <div className="gap-2 flex flex-col">
                <h2 className="text-3xl font-semibold tracking-tight text-center">
                  Hello, how can I help you?
                </h2>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
