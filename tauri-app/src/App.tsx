import ChatInputForm from "./components/chat/ChatInputForm";
import MessagesList from "./components/chat/MessagesList";

function App() {
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <MessagesList />

      <ChatInputForm />
    </div>
  );
}

export default App;
