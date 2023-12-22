import MessagePreviewItem from "./MessagePreviewItem";

export default function MessagesPreviewList() {
  return (
    <div className="flex-1 w-full flex flex-col px-4 py-6">
      <MessagePreviewItem selected={false} />
    </div>
  );
}
