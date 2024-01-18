import { Record } from "@web5/api";
import { useNavigate } from "react-router-dom";
import FileIcon from "./FileIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { MoreHorizontal, Trash, Trash2 } from "lucide-react";
import FileContextMenu from "./FileContextMenu";
import { getFileType } from "@/lib/utils";
import useWeb5Store from "@/features/app/useWeb5Store";
import { useState } from "react";
import { MyFile } from "@/types/MyFile";
import { invalidateFilesQuery, useDeleteFileMutation } from "../hooks";
import useAppStore from "@/features/app/useAppStore";

export default function FileListItem({
  file,
}: // index,
{
  file: {
    record: Record;
    data: MyFile;
    thumbnailBlob: Blob | null;
  };
  index: number;
}) {
  const navigate = useNavigate();
  const did = useWeb5Store((state) => state.did);
  const [, setEditing] = useState(false);
  const deleteFileMutation = useDeleteFileMutation();
  const setLoading = useAppStore((state) => state.actions.setLoading);

  return (
    <div key={file.record.id} className="p-2">
      {true ? (
        <FileContextMenu file={file} setEditing={setEditing}>
          <div
            key={file.record.id}
            className={`h-auto w-full rounded-sm flex flex-row items-center p-2  hover:cursor-pointer transition overflow-x-visible z-50 hover:bg-card-foreground`}
            onClick={async () => {
              const fileType = getFileType(file.data.type);
              if (fileType === "pdf")
                navigate(`/file/pdf/${did}/${file.record.id}`);
              else if (fileType === "image")
                navigate(`/file/image/${did}/${file.record.id}`);
              else if (fileType === "video")
                navigate(`/file/video/${did}/${file.record.id}`);
              else {
                window.open(
                  `${import.meta.env.DWN_URL}/${did}/record/${file.record.id}`,
                  "_blank"
                );
              }
            }}
          >
            <div className="flex items-center justify-center">
              <FileIcon
                file={file.data}
                type="file"
                thumbnailBlob={file.thumbnailBlob}
              />{" "}
            </div>
            <div className="flex flex-1 flex-col ml-4 gap-[2px]">
              <div className="text-sm font-normal flex flex-1 max-w-[calc(100vw-30vw)] truncate">
                {file.data.name}
              </div>

              <small className="text-xs text-gray-500 font-medium leading-none">
                {new Date(file.record.dateCreated).toLocaleDateString()}
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
                    deleteFileMutation.mutate(file.record.id, {
                      onSuccess: () => {
                        invalidateFilesQuery();
                        setLoading(false);
                      },
                      onError: () => {
                        setLoading(false);
                      },
                    });
                  }}
                  className="cursor-pointer roun"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </FileContextMenu>
      ) : (
        <div
          key={file.record.id}
          className={`h-14 w-full rounded-lg flex flex-row items-center p-2  hover:cursor-pointer transition overflow-x-visible z-50 hover:bg-primary-foreground`}
        >
          <FileIcon
            file={file.data}
            type="file"
            thumbnailBlob={file.thumbnailBlob}
          />

          <div className="flex flex-1 flex-col ml-4 gap-[2px]">
            <div className="text-md md:text-lg font-normal max-w-[221px] sm:max-w-[400px] xl:max-w-[400px] truncate">
              {file.data.name}
            </div>

            <small className="text-sm text-gray-500 font-medium leading-none">
              {file.record.dateCreated && (
                <>{new Date(file.record.dateCreated).toLocaleDateString()}</>
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
                  deleteFileMutation.mutate(file.record.id);
                }}
                className="cursor-pointer "
              >
                <Trash className="w-4 h-4 mr-2 text-red-500" />
                <div className="text-red-500">Delete</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
