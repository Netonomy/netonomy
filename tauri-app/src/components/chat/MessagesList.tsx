import useChatStore from "@/stores/useChatStore";
import { listen } from "@tauri-apps/api/event";
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
        console.log(event);

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
    <div className="flex flex-1 h flex-col items-center w-full relative overflow-y-auto max-h-[calc(100vh-115px)] max-w-[1000px]">
      <div className="h-full w-full p-4 flex overflow-y-auto flex-col-reverse z-30 pt-[60px]">
        {messages
          .slice()
          .reverse()
          .map((message, i) => (
            <Fragment key={i}>
              {message.role === "user" && (
                <div
                  className={`my-2 p-3 rounded-xl inline-block bg-primary text-white ml-auto whitespace-pre-wrap`}
                >
                  {message.content}
                </div>
              )}
              {message.role === "assistant" && (
                <div
                  className={`my-2 p-3 rounded-2xl inline-block bg-secondary text-primary mr-auto max-w-[90%] whitespace-pre-wrap ${
                    generating && message.content === "" && "animate-bounce"
                  }`}
                >
                  {message.content}
                </div>
              )}
            </Fragment>
          ))}
      </div>
    </div>
  );
}
