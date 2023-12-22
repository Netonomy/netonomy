import Header from "@/components/Header";
import Chat from "@/components/messages/chat/Chat";

export default function MessagesPage() {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center relative">
      <Header />
      <Chat showBackButton />
    </div>
  );
}
