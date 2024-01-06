import { selectedStorageDisplayTabAtom } from "@/stores/useFileStorageStore";
import FileGrid from "./FileGrid";
import StorageHeader from "./StorageHeader";
import FileList from "./FileList";
import { useAtom } from "jotai/react";

export default function Storage() {
  const [selectedDisplayTab] = useAtom(selectedStorageDisplayTabAtom);
  return (
    <div className="flex-1 w-full flex flex-col">
      <StorageHeader />

      {selectedDisplayTab === "grid" ? <FileGrid /> : <FileList />}
    </div>
  );
}
