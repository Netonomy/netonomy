import useCollectionStore, {
  Collection,
  DigitalDocument,
} from "@/stores/useFileStorageStore";
import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { Copy, Lock, MoreHorizontal, Share, Trash, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import FileIcon from "./FileIcon";

function FileGrid() {
  const navigate = useNavigate();
  const collectionItems = useCollectionStore((state) => state.collectionItems);
  const fetchCollection = useCollectionStore(
    (state) => state.actions.fetchFilesAndFolders
  );
  const deleteItem = useCollectionStore((state) => state.actions.deleteItem);
  const uploadFile = useCollectionStore((state) => state.actions.uploadFile);
  const fetchBlob = useCollectionStore((state) => state.actions.fetchBlob);
  const updateFile = useCollectionStore(
    (state) => state.actions.updateFileItem
  );

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
        className={`w-full flex-1 overflow-y-auto grid grid-cols-auto grid-rows-sm rounded-lg  max-h-[calc(100vh-120px)] md:max-h-min ${
          isDragActive && "bg-primary-foreground"
        }`}
        {...getRootProps()}
      >
        {collectionItems &&
          collectionItems.map((file, i) => {
            const type = file.data["@type"];
            const isFolder = type === "Collection";

            return (
              <div key={file.data.identifier} className="p-6">
                {!isFolder ? (
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <div
                        key={i}
                        className={`h-auto w-full rounded-lg flex flex-col items-center gap-4 relative p-4 hover:cursor-pointer transition overflow-x-visible z-50 hover:bg-primary-foreground`}
                        onClick={async () => {
                          if (
                            (file.data as DigitalDocument).encodingFormat ===
                            "application/pdf"
                          )
                            navigate(
                              `/pdf/${
                                (file.data as DigitalDocument).identifier
                              }`
                            );
                          else if (
                            (file.data as DigitalDocument).encodingFormat ===
                              "image/jpeg" ||
                            (file.data as DigitalDocument).encodingFormat ===
                              "image/png" ||
                            (file.data as DigitalDocument).encodingFormat ===
                              "image/gif" ||
                            (file.data as DigitalDocument).encodingFormat ===
                              "image/webp" ||
                            (file.data as DigitalDocument).encodingFormat ===
                              "image/svg+xml"
                          )
                            navigate(
                              `/image/${
                                (file.data as DigitalDocument).identifier
                              }`
                            );
                          else if (
                            (file.data as DigitalDocument).encodingFormat ===
                              "video/mp4" ||
                            (file.data as DigitalDocument).encodingFormat ===
                              "video/quicktime" ||
                            (file.data as DigitalDocument).encodingFormat ===
                              "video/x-flv" ||
                            (file.data as DigitalDocument).encodingFormat ===
                              "video/MP2T" ||
                            (file.data as DigitalDocument).encodingFormat ===
                              "video/x-msvideo" ||
                            (file.data as DigitalDocument).encodingFormat ===
                              "video/x-ms-wmv"
                          )
                            navigate(
                              `/video/${
                                (file.data as DigitalDocument).identifier
                              }`
                            );
                          else {
                            const blob = await fetchBlob(
                              (file.data as DigitalDocument).fileBlobId
                            );
                            if (blob)
                              window.open(URL.createObjectURL(blob), "_blank");
                          }
                        }}
                      >
                        <div className="flex flex-1 w-full items-center justify-center ">
                          <FileIcon
                            file={file.data as DigitalDocument}
                            type="file"
                          />
                        </div>

                        <div className="flex w-full flex-col gap-[2px]">
                          <div className="text-xs md:text-xs font-normal truncate text-center">
                            {(file.data as DigitalDocument).name}
                          </div>

                          <small className="text-xs text-gray-500 leading-none text-center">
                            {(file.data as DigitalDocument).datePublished &&
                              new Date(
                                (file.data as DigitalDocument).datePublished!
                              ).toLocaleDateString()}
                          </small>
                        </div>

                        {/* <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreHorizontal className="hover:bg-gray-200 dark:hover:opacity-80 dark:hover:hover:bg-[#0d0d0d] p-2 h-9 w-9 rounded-full" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="rounded-xl">
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteItem(file.identifier);
                          }}
                          className="cursor-pointer roun"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu> */}
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <Share className="w-4 h-4 mr-2 text-inherit" />
                          Share
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                          <ContextMenuCheckboxItem
                            checked={!file.record.published}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateFile(
                                (file.data as DigitalDocument).identifier,
                                file.data as DigitalDocument,
                                false
                              );
                            }}
                          >
                            <Lock className="w-4 h-4 mr-2 text-inherit" />
                            Private
                          </ContextMenuCheckboxItem>
                          <ContextMenuCheckboxItem
                            checked={file.record.published}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateFile(
                                (file.data as DigitalDocument).identifier,
                                file.data as DigitalDocument,
                                true
                              );
                            }}
                          >
                            <Share className="w-4 h-4 mr-2 text-inherit" />
                            Shareable
                          </ContextMenuCheckboxItem>

                          {file.record.published && (
                            <ContextMenuItem
                              inset
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();

                                navigator.clipboard.writeText(
                                  `${import.meta.env.VITE_DWN_URL}/${
                                    file.record.author
                                  }/records/${
                                    (file.data as DigitalDocument).fileBlobId
                                  }`
                                );
                              }}
                            >
                              <Copy className="w-2 h-2 mr-2 text-inherit" />
                              <p className="text-sm text-muted-foreground">
                                Copy Link
                              </p>
                            </ContextMenuItem>
                          )}
                        </ContextMenuSubContent>
                      </ContextMenuSub>

                      <ContextMenuItem
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteItem((file.data as DigitalDocument).identifier);
                        }}
                      >
                        <Trash className="w-4 h-4 mr-2 text-inherit" />
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ) : (
                  <div
                    key={i}
                    className={`h-14 w-full rounded-lg flex flex-row items-center p-2  hover:cursor-pointer transition overflow-x-visible z-50 hover:bg-primary-foreground`}
                  >
                    <FileIcon type={"folder"} />

                    <div className="flex flex-1 flex-col ml-4 gap-[2px]">
                      <div className="text-md md:text-lg font-normal max-w-[221px] sm:max-w-[400px] xl:max-w-[400px] truncate">
                        {(file.data as Collection).name}
                      </div>

                      <small className="text-sm text-gray-500 font-medium leading-none">
                        {(file.data as Collection).dateCreated && (
                          <>
                            {new Date(
                              (file.data as Collection).dateCreated
                            ).toLocaleDateString()}
                          </>
                        )}
                      </small>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreHorizontal className="hover:bg-gray-200 dark:hover:opacity-80 dark:hover:hover:bg-[#0d0d0d] p-2 h-9 w-9 rounded-full" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="rounded-xl">
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteItem((file.data as Collection).identifier);
                          }}
                          className="cursor-pointer roun"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default FileGrid;
