import { File, Folder, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useRef } from "react";
import useFiles from "@/hooks/useFiles";
import { Input } from "../ui/input";
import FileIcon from "../FileIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export function StorageWidget() {
  const navigate = useNavigate();
  const { uploadFiles, files, deleteFile } = useFiles();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    uploadFiles(files);
  };

  return (
    <div className="h-full w-full flex flex-1 flex-col items-center justify-center gap-4">
      <div className="w-full flex gap-4">
        <Input
          placeholder="Search"
          className="w-full shadow-lg bg-white rounded-xl"
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
            <DropdownMenuItem className="rounded-xl">
              <Folder className="mr-2 h-4 w-4" />
              <span>Folder</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl">
              <File className="mr-2 h-4 w-4" />
              <span>File</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* <>
          <Input
            type="file"
            multiple
            id="my-input"
            className="hidden"
            ref={inputRef}
            onChange={handleChange}
          />
        </> */}
      </div>

      <Card className=" flex flex-col flex-1 rounded-xl shadow-lg w-full">
        <CardContent className="h-full w-full flex flex-1 p-4 overflow-y-auto max-h-[calc(100vh-135px)]">
          <div className="flex flex-col w-full">
            {files.map((file, i) => (
              <div
                key={i}
                className={`h-14 w-full rounded-lg flex flex-row items-center p-2  hover:cursor-pointer transition overflow-x-visible z-50 hover:bg-primary-foreground`}
                onClick={() => {
                  navigate(`/${file.identifier}`);
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
                        deleteFile(file.identifier);
                      }}
                      className="cursor-pointer rounded-xl"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {files.length === 0 && (
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
