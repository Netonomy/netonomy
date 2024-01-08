import useCollectionStore, {
  selectedStorageDisplayTabAtom,
} from "@/stores/useFileStorageStore";
import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Skeleton } from "../ui/skeleton";
import FileGridItem from "./FileGridItem";
import { useAtom } from "jotai/react";
import FileListItem from "./FileListItem";

function FileGrid() {
  const collectionItems = useCollectionStore((state) => state.collectionItems);
  const fetchCollection = useCollectionStore(
    (state) => state.actions.fetchFilesAndFolders
  );
  const uploadFile = useCollectionStore((state) => state.actions.uploadFile);
  const [selectedDisplayTab] = useAtom(selectedStorageDisplayTabAtom);
  const fetching = useCollectionStore((state) => state.fetching);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      uploadFile(file);
    }
  }, []);

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  useEffect(() => {
    fetchCollection(undefined);
  }, []);

  if (collectionItems?.length === 0) {
    return (
      <div className="flex flex-1 w-full overflow-y-auto p-2">
        <div
          className={`w-full flex-1 rounded-lg items-center flex justify-center ${
            isDragActive && "bg-primary-foreground"
          }`}
          {...getRootProps()}
        >
          <div className="text-2xl font-medium text-primary">
            Start by dragging a file here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 w-full overflow-y-auto p-2 max-h-[calc(100vh-100px)] ">
      <div
        className={`${
          selectedDisplayTab === "list"
            ? "w-full flex-1 overflow-y-auto max-h-[calc(100vh-90px)] md:max-h-[calc(100vh-100px)] items-center rounded-lg "
            : " w-full flex-1 overflow-y-auto grid grid-cols-auto grid-rows-sm rounded-lg  max-h-[calc(100vh-120px)] md:max-h-min "
        } ${isDragActive && "bg-primary-foreground"}`}
        {...getRootProps()}
      >
        {fetching && (
          <>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="p-2">
                <div
                  className={`h-auto w-full rounded flex flex-col items-center gap-4 relative p-4 hover:cursor-pointer transition overflow-x-visible z-50 hover:bg-primary-foreground`}
                >
                  <Skeleton className="w-24 h-24 rounded-lg" />

                  <Skeleton className="w-20 h-3 rounded-lg" />
                </div>
              </div>
            ))}
          </>
        )}

        {collectionItems &&
          collectionItems.map((file) => {
            return selectedDisplayTab === "grid" ? (
              <FileGridItem file={file} key={file.data.identifier} />
            ) : (
              <FileListItem file={file} key={file.data.identifier} />
            );
          })}
      </div>
    </div>
  );
}

export default FileGrid;
