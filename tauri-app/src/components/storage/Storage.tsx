import FileGrid from "./FileGrid";
import StorageHeader from "./StorageHeader";

export default function Storage() {
  return (
    <div className="flex-1 w-full flex flex-col">
      <StorageHeader />

      <FileGrid />
    </div>
  );
}
