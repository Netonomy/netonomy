import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import useChatStore from "@/stores/useChatStore";
import { ArrowLeft, Bot, PlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChatHeader({
  showBackButton,
}: {
  showBackButton: boolean;
}) {
  const navigate = useNavigate();
  const messages = useChatStore((state) => state.messages);
  const resetChat = useChatStore((state) => state.actions.resetChat);

  return (
    <div className="absolute top-0 left-0 right-0 h-[55px] z-40 backdrop-blur-xl ">
      <div className="h-full w-full flex items-center justify-between p-6">
        <div className="w-[10%]">
          {showBackButton && (
            <Button
              variant={"ghost"}
              onClick={() => navigate("/")}
              size={"icon"}
            >
              <ArrowLeft />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 w-[80%] justify-center relative ">
          {messages.length > 0 && (
            <Avatar>
              <Bot className="w-full h-full" />
            </Avatar>
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
  );
}
