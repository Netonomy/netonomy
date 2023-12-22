import ChatHeader from "./ChatHeader";
import ChatInputForm from "./ChatInputForm";
import MessagesList from "./MessagesList";

export default function Chat({ showBackButton }: { showBackButton: boolean }) {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center relative">
      <ChatHeader showBackButton={showBackButton} />

      <MessagesList />

      <ChatInputForm />
    </div>
  );
}
