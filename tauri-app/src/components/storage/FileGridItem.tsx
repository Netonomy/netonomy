import useStorageStore, {
  Collection,
  DigitalDocument,
} from "@/stores/useFileStorageStore";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import FileIcon from "./FileIcon";
import { Record } from "@web5/api";
import FileContextMenu from "./FileContextMenu";
import useWeb5Store from "@/stores/useWeb5Store";
import { getFileType } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import InlineEdit from "../ui/InlineEdit";
import { Input } from "../ui/input";

export default function FileGridItem({
  file,
}: {
  file: {
    data: DigitalDocument | Collection;
    record: Record;
  };
}) {
  const navigate = useNavigate();
  const type = file.data["@type"];
  const isFolder = type === "Collection";
  const did = useWeb5Store((state) => state.did);
  const [editing, setEditing] = useState(false);

  const fetchBlob = useStorageStore((state) => state.actions.fetchBlob);
  const deleteItem = useStorageStore((state) => state.actions.deleteItem);
  const updateFile = useStorageStore((state) => state.actions.updateFileItem);

  const [fileName, setFileName] = useState("");
  const fileNameRef = useRef(fileName);

  useEffect(() => {
    if (file?.data) {
      setFileName(file.data.name);
      fileNameRef.current = file.data.name;
    }
  }, [file]);

  return (
    <div key={file.data.identifier} className="p-6">
      {!isFolder ? (
        <FileContextMenu file={file} setEditing={setEditing}>
          <div
            key={file.data.identifier}
            className={`h-auto w-full rounded-lg flex flex-col items-center gap-4 relative p-4 hover:cursor-pointer transition overflow-x-visible z-50 hover:bg-card`}
            onClick={async () => {
              if (editing) return;
              const fileType = getFileType(
                (file.data as DigitalDocument).encodingFormat
              );
              if (fileType === "pdf") navigate(`/pdf/${did}/${file.record.id}`);
              else if (fileType === "image")
                navigate(`/image/${did}/${file.record.id}`);
              else if (fileType === "video")
                navigate(
                  `/video/${did}/${(file.data as DigitalDocument).identifier}`
                );
              else {
                const blob = await fetchBlob(
                  (file.data as DigitalDocument).fileBlobId
                );
                if (blob) window.open(URL.createObjectURL(blob), "_blank");
              }
            }}
          >
            <div className="flex flex-1 w-full items-center justify-center ">
              <FileIcon file={file.data as DigitalDocument} type="file" />
            </div>

            <div className="flex w-full flex-col gap-[2px]">
              <InlineEdit
                readView={
                  <div className="text-xs md:text-xs font-normal truncate text-center">
                    {(file.data as DigitalDocument).name}
                  </div>
                }
                editView={
                  <Input
                    autoFocus
                    value={fileName}
                    onChange={(e) => {
                      setFileName(e.target.value);
                      fileNameRef.current = e.target.value;
                    }}
                    onFocus={(e) => {
                      // Highlight filename without extension
                      const dotIndex = e.target.value.indexOf(".");
                      if (dotIndex !== -1) {
                        e.target.setSelectionRange(0, dotIndex);
                      }
                    }}
                  />
                }
                onConfirm={() => {
                  if (file?.data.name === fileNameRef.current) return;
                  if (file) {
                    const data = {
                      ...file.data,
                      name: fileNameRef.current,
                    };
                    updateFile(
                      file.record.id,
                      data as DigitalDocument,
                      file.record.published
                    );
                  }
                }}
                editing={editing}
                setEditing={setEditing}
              />

              <small className="text-xs text-gray-500 leading-none text-center">
                {(file.data as DigitalDocument).datePublished &&
                  new Date(
                    (file.data as DigitalDocument).datePublished!
                  ).toLocaleDateString()}
              </small>
            </div>
          </div>
        </FileContextMenu>
      ) : (
        <div
          key={file.data.identifier}
          className={`h-14 w-full rounded-lg flex flex-row items-center p-2  hover:cursor-pointer transition overflow-x-visible z-50 hover:bg-card`}
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
}
