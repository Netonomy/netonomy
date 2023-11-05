import { Chat } from "@/components/Chat";
import useChat from "@/hooks/useChat";

export default function AiChatPage() {
  const { conversations } = useChat();

  return (
    <div className={`h-screen w-screen flex items-center p-8 gap-10 relative`}>
      <Chat />
    </div>
  );
}
