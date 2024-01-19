import { MoreHorizontal, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import FileIcon from "./FileIcon";
import FileContextMenu from "./FileContextMenu";
import useWeb5Store from "@/features/app/useWeb5Store";
import { getFileType } from "@/lib/utils";
import { useState } from "react";
import InlineEdit from "../../../components/ui/InlineEdit";
import { Input } from "../../../components/ui/input";
import { MyFile } from "@/types/MyFile";
import { Record } from "@web5/api";
import { useDeleteFileMutation } from "../hooks";

export default function FileGridItem({
  file,
}: {
  file: {
    record: Record;
    data: MyFile;
    thumbnailBlob: Blob | null;
  };
}) {
  const navigate = useNavigate();
  const did = useWeb5Store((state) => state.did);
  const [editing, setEditing] = useState(false);
  const deleteFileMutation = useDeleteFileMutation();

  const [, setFileName] = useState("");

  return (
    <>
      {true ? (
        <FileContextMenu file={file} setEditing={setEditing}>
          <div
            key={file.record.id}
            className={`h-auto w-full rounded-lg flex flex-col items-center gap-3 relative p-4 hover:cursor-pointer transition overflow-x-visible hover:bg-card-foreground `}
            onClick={async () => {
              if (editing) return;
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
            <div className="flex flex-1 w-full items-center justify-center ">
              <FileIcon
                file={file.data}
                type="file"
                thumbnailBlob={file.thumbnailBlob}
              />
            </div>

            <div className="flex w-full flex-col gap-[2px]">
              <InlineEdit
                defaultValue={file.data.name}
                turnOnEditing={editing}
                readView={
                  <div className="text-xs md:text-xs font-normal text-wrap text-center break-words">
                    {file.data.name}
                  </div>
                }
                editView={({ fieldProps }) => (
                  <Input
                    {...fieldProps}
                    onFocus={(e) => {
                      // Highlight filename without extension
                      const dotIndex = e.target.value.indexOf(".");
                      if (dotIndex !== -1) {
                        e.target.setSelectionRange(0, dotIndex);
                      }
                    }}
                  />
                )}
                onConfirm={(value) => {
                  setFileName(value);
                  setEditing(false);
                  if (file?.data.name === value) return;
                  // if (file) {
                  //   const data = {
                  //     ...file,
                  //     name: value,
                  //   };
                  //   updateFile(
                  //     file.record.id,
                  //     data as DigitalDocument,
                  //     file.record.published
                  //   );
                  // }
                }}
              />

              {/* <small className="text-xs text-gray-500 leading-none text-center">
                {(file.data as DigitalDocument).datePublished &&
                  new Date(
                    (file.data as DigitalDocument).datePublished!
                  ).toLocaleDateString()}
              </small> */}
            </div>
          </div>
        </FileContextMenu>
      ) : (
        <div
          key={file.record.id}
          className={`h-14 w-full rounded-lg flex flex-row items-center p-2  hover:cursor-pointer transition overflow-x-visible z-50 hover:bg-card`}
        >
          <FileIcon type={"folder"} thumbnailBlob={file.thumbnailBlob} />

          <div className="flex flex-1 flex-col ml-4 gap-[2px]">
            <div className="text-md md:text-lg font-normal max-w-[221px] sm:max-w-[400px] xl:max-w-[400px] truncate">
              {file.data.name}
            </div>

            <small className="text-sm text-gray-500 font-medium leading-none">
              {file.data.dateCreated && (
                <>{new Date(file.data.dateCreated).toLocaleDateString()}</>
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
                className="cursor-pointer roun"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </>
  );
}
