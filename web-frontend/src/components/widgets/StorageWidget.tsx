import { File, Folder, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import FileIcon from "../FileIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CreateFolderDialog } from "../CreateFolderDialog";
import useCollectionStore from "@/hooks/stores/useCollectionStore";
import { Skeleton } from "../ui/skeleton";
import { useDropzone } from "react-dropzone";

export function StorageWidget() {
  const navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();
  const folderId = searchParams.get("folderId");
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFile = useCollectionStore((state) => state.actions.uploadFile);
  const collectionItems = useCollectionStore((state) => state.collectionItems);
  const fetchCollection = useCollectionStore(
    (state) => state.actions.fetchFilesAndFolders
  );
  const fetchingCollection = useCollectionStore((state) => state.fetching);
  const deleteItem = useCollectionStore((state) => state.actions.deleteItem);

  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of files) {
      uploadFile(file);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      uploadFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  useEffect(() => {
    fetchCollection(folderId || undefined);
  }, [folderId]);

  return (
    <div className="h-full w-full flex flex-1 flex-col items-center justify-center gap-4">
      <div className="w-full flex gap-4">
        <Input
          placeholder="Search"
          className="w-full shadow-lg bg-white rounded-xl"
        />

        <CreateFolderDialog
          open={showCreateFolderDialog}
          handleChange={() =>
            setShowCreateFolderDialog(!showCreateFolderDialog)
          }
        />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                inputRef.current?.click();
              }}
              className="rounded-xl shadow-lg bg-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-xl">
            <DropdownMenuItem
              className="rounded-xl"
              onClick={() => setShowCreateFolderDialog(true)}
            >
              <Folder className="mr-2 h-4 w-4" />
              <span>Folder</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-xl"
              onClick={() => {
                inputRef.current?.click();
              }}
            >
              <File className="mr-2 h-4 w-4" />
              <span>File</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <>
          <Input
            type="file"
            multiple
            id="my-input"
            className="hidden"
            ref={inputRef}
            onChange={handleChange}
          />
        </>
      </div>

      <Card
        {...getRootProps()}
        className={`flex flex-1  shadow-lg rounded-xl w-full ${
          isDragActive ? "bg-gray-100 dark:bg-[#1d1d1d]" : ""
        }`}
      >
        <CardContent className="h-full w-full flex flex-1 p-4 overflow-y-auto max-h-[calc(100vh-135px)]">
          <div className="flex flex-col w-full">
            {collectionItems &&
              collectionItems.map((file, i) => {
                const type = file["@type"];
                const isFolder = type === "Collection";

                return (
                  <Fragment key={file.identifier}>
                    {!isFolder ? (
                      <div
                        key={i}
                        className={`h-14 w-full rounded-lg flex flex-row items-center p-2  hover:cursor-pointer transition overflow-x-visible z-50 hover:bg-primary-foreground`}
                        onClick={() => {
                          if (file.encodingFormat === "application/pdf")
                            navigate(`/pdf/${file.identifier}`);
                          else if (
                            file.encodingFormat === "image/png" ||
                            file.encodingFormat === "image/jpeg"
                          ) {
                          }
                        }}
                      >
                        <FileIcon type={file.encodingFormat} />

                        <div className="flex flex-1 flex-col ml-4 gap-[2px]">
                          <div className="text-md md:text-lg font-normal max-w-[221px] sm:max-w-[400px] xl:max-w-[400px] truncate">
                            {file.name}
                          </div>

                          <small className="text-sm text-gray-500 font-medium leading-none">
                            {new Date(file.datePublished).toLocaleDateString()}
                          </small>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreHorizontal className="hover:bg-gray-200 dark:hover:opacity-80 dark:hover:hover:bg-[#0d0d0d] p-2 h-9 w-9 rounded-full" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="rounded-xl">
                            {/* <DropdownMenuItem
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                    className="cursor-pointer"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem> */}
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
                        </DropdownMenu>
                      </div>
                    ) : (
                      <div
                        key={i}
                        className={`h-14 w-full rounded-lg flex flex-row items-center p-2  hover:cursor-pointer transition overflow-x-visible z-50 hover:bg-primary-foreground`}
                        onClick={() => {
                          setSearchParams({
                            folderId: file.identifier,
                          });
                        }}
                      >
                        <FileIcon type={"folder"} />

                        <div className="flex flex-1 flex-col ml-4 gap-[2px]">
                          <div className="text-md md:text-lg font-normal max-w-[221px] sm:max-w-[400px] xl:max-w-[400px] truncate">
                            {file.name}
                          </div>

                          <small className="text-sm text-gray-500 font-medium leading-none">
                            {file.dateCreated && (
                              <>
                                {new Date(
                                  file.dateCreated
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
                                deleteItem(file.identifier);
                              }}
                              className="cursor-pointer roun"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </Fragment>
                );
              })}

            {fetchingCollection && (
              <div className="flex flex-col items-center w-full gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-14 w-full rounded-lg flex flex-row items-center p-2 transition overflow-x-visible z-50"
                  />
                ))}
              </div>
            )}

            {collectionItems && collectionItems.length === 0 && (
              <div className="w-full h-[90%] flex items-center justify-center">
                <div className="text-lg font-semibold">
                  No files uploaded yet
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
