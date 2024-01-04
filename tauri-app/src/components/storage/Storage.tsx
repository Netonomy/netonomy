import useCollectionStore from "@/stores/useCollectionStore";
import FileGrid from "./FileGrid";
import StorageHeader from "./StorageHeader";
import FileList from "./FileList";

export default function Storage() {
  const selectedDisplayTab = useCollectionStore(
    (state) => state.selectedDisplayTab
  );
  return (
    <div className="flex-1 w-full flex flex-col">
      <StorageHeader />

      {selectedDisplayTab === "grid" ? <FileGrid /> : <FileList />}
    </div>
  );
}
