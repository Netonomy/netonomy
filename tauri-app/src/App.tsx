import { PlusIcon } from "lucide-react";
import ChatInputForm from "./components/chat/ChatInputForm";
import MessagesList from "./components/chat/MessagesList";
import { Button } from "./components/ui/button";
import useChatStore from "./stores/useChatStore";

function App() {
  const messages = useChatStore((state) => state.messages);
  const resetChat = useChatStore((state) => state.actions.resetChat);

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <div className="absolute top-0 left-0 right-0 h-[55px] z-40 backdrop-blur-xl ">
        <div className="h-full w-full flex items-center justify-between p-6">
          <div className="w-[10%]"></div>
          <div className="flex items-center gap-2 w-[80%] justify-center relative ">
            {messages.length > 0 && (
              <>
                {/* <img
                  src="/AI.png"
                  height={45}
                  width={45}
                  alt="agent-ring"
                  className="absolute top-0 left-0 right-0 bottom-0 m-auto"
                /> */}
              </>
            )}
          </div>

          <div className="w-[10%]">
            {messages && messages.length > 0 && (
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

      <MessagesList />

      <ChatInputForm />
    </div>
  );
}

export default App;
