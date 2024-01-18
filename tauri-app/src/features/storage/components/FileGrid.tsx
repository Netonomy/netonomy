import { useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Skeleton } from "../../../components/ui/skeleton";
import FileGridItem from "./FileGridItem";
import {
  invalidateFilesQuery,
  useFilesQuery,
  useUploadFileMutation,
} from "../hooks";
import useAppStore from "@/features/app/useAppStore";
import useStorageStore from "../store";
import FileListItem from "./FileListItem";

function FileGrid() {
  const gridRef = useRef<any>(null);
  const selectedDisplayTab = useStorageStore((state) => state.selectedDisplay);
  const filesQuery = useFilesQuery();
  const uploadFileMutation = useUploadFileMutation();
  const setLoading = useAppStore((state) => state.actions.setLoading);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      setLoading(true);
      uploadFileMutation.mutate(file, {
        onSuccess: () => {
          invalidateFilesQuery();
          setLoading(false);
        },
      });
    }
  }, []);

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, false);
    return () => {
      document.removeEventListener("click", handleClickOutside, false);
    };
  }, []);

  const handleClickOutside = (event: any) => {
    if (gridRef.current && !gridRef.current.contains(event.target)) {
      // clearSelectedFileIds();
    }
  };

  if (filesQuery.data?.length === 0) {
    return (
      <div className="flex flex-1 w-full overflow-y-auto p-2">
        <div
          className={`w-full flex-1 rounded-lg items-center flex justify-center ${
            isDragActive && "bg-card-foreground"
          }`}
          {...getRootProps()}
        >
          <div className="text-2xl font-medium">
            Start by dragging a file here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 w-full overflow-y-auto max-h-[calc(100vh-100px)]"
      ref={gridRef}
    >
      <div
        className={`${
          selectedDisplayTab === "list"
            ? "w-full flex-1 overflow-y-auto max-h-[calc(100vh-90px)] md:max-h-[calc(100vh-100px)] items-center rounded-lg "
            : " w-full flex-1 overflow-y-auto grid grid-cols-auto gap-0 grid-rows-sm rounded-lg max-h-[calc(100vh-120px)] md:max-h-min justify-center md:justify-start "
        } ${isDragActive && "bg-card-foreground"}`}
        {...getRootProps()}
      >
        {filesQuery.isLoading ? (
          <>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="">
                {selectedDisplayTab === "grid" ? (
                  <div
                    className={`h-auto w-full rounded flex flex-col items-center gap-4 relative p-4 hover:cursor-pointer transition overflow-x-visible z-50 hover:bg-card-foreground`}
                  >
                    <Skeleton className="min-h-[65px] min-w-[65px] max-w-[65px] max-h-[65px] md:min-h-[80px] md:min-w-[80px] md:max-h-[80px] md:max-w-[80px] rounded-lg" />

                    <Skeleton className="w-20 h-3 rounded-lg" />
                  </div>
                ) : (
                  <div
                    className={`h-auto w-full rounded-lg flex flex-row items-center p-2  hover:cursor-pointer transition overflow-x-visible z-50 hover:bg-card-foreground`}
                  >
                    <div className="flex items-center justify-center">
                      <Skeleton className="min-h-[60px] min-w-[60px] max-h-[60px] max-w-[60px] rounded-lg" />
                    </div>

                    <div className="flex flex-1 flex-col ml-4 gap-2">
                      <div className="text-sm font-normal flex flex-1 max-w-[calc(100vw-30vw)] truncate">
                        <Skeleton className="w-[60%] h-4 rounded-lg" />
                      </div>

                      <small className="text-xs text-gray-500 font-medium leading-none">
                        <Skeleton className="w-[20%] h-3 rounded-lg" />
                      </small>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          <>
            {filesQuery.data &&
              filesQuery.data.map((file, i) => {
                return selectedDisplayTab === "grid" ? (
                  <FileGridItem file={file} key={file.record.id} />
                ) : (
                  <FileListItem file={file} key={file.record.id} index={i} />
                );
              })}
          </>
        )}
      </div>
    </div>
  );
}

export default FileGrid;
