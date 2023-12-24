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
    <div className="flex flex-1 flex-col items-center w-full relative overflow-y-auto max-w-[1000px]">
      <div className="h-full w-full p-4 flex overflow-y-auto flex-col-reverse z-30 pt-[60px]">
        {messages.length > 0 ? (
          messages
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
            ))
        ) : (
          <div className=" flex flex-1 mb-20 flex-col items-center gap-4 w-[95%] p-4 justify-center">
            <div className="flex flex-col gap-4 items-center max-w-[600px]">
              <div className="h-[200px] w-[200px] rounded-full overflow-hidden relative">
                <img src="/AI.png" height={200} width={200} alt="agent-ring" />
              </div>

              <div className="gap-2 flex flex-col">
                <h2 className="text-3xl font-semibold tracking-tight text-center">
                  Send a new message
                </h2>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
