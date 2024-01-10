import useStorageStore, {
  Collection,
  DigitalDocument,
} from "@/stores/useFileStorageStore";
import { Record } from "@web5/api";
import { useNavigate } from "react-router-dom";
import FileIcon from "./FileIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import FileContextMenu from "./FileContextMenu";

export default function FileListItem({
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

  const fetchBlob = useStorageStore((state) => state.actions.fetchBlob);
  const deleteItem = useStorageStore((state) => state.actions.deleteItem);

  return (
    <div key={file.data.identifier} className="p-2">
      {!isFolder ? (
        <FileContextMenu file={file}>
          <div
            key={file.data.identifier}
            className={`h-auto w-full rounded-lg flex flex-row items-center p-2  hover:cursor-pointer transition overflow-x-visible z-50 hover:bg-primary-foreground`}
            onClick={async () => {
              if (
                (file.data as DigitalDocument).encodingFormat ===
                "application/pdf"
              )
                navigate(`/pdf/${(file.data as DigitalDocument).identifier}`);
              else if (
                (file.data as DigitalDocument).encodingFormat ===
                  "image/jpeg" ||
                (file.data as DigitalDocument).encodingFormat === "image/png" ||
                (file.data as DigitalDocument).encodingFormat === "image/gif" ||
                (file.data as DigitalDocument).encodingFormat ===
                  "image/webp" ||
                (file.data as DigitalDocument).encodingFormat ===
                  "image/svg+xml"
              )
                navigate(`/image/${(file.data as DigitalDocument).identifier}`);
              else if (
                (file.data as DigitalDocument).encodingFormat === "video/mp4" ||
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
                navigate(`/video/${(file.data as DigitalDocument).identifier}`);
              else {
                const blob = await fetchBlob(
                  (file.data as DigitalDocument).fileBlobId
                );
                if (blob) window.open(URL.createObjectURL(blob), "_blank");
              }
            }}
          >
            <div className="flex items-center justify-center">
              <FileIcon type={"file"} file={file.data as DigitalDocument} />
            </div>
            <div className="flex flex-1 flex-col ml-4 gap-[2px]">
              <div className="text-sm font-normal flex flex-1 max-w-[calc(100vw-30vw)] truncate">
                {(file.data as DigitalDocument).name}
              </div>

              <small className="text-xs text-gray-500 font-medium leading-none">
                {(file.data as DigitalDocument).datePublished &&
                  new Date(
                    (file.data as DigitalDocument).datePublished!
                  ).toLocaleDateString()}
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
                    deleteItem((file.data as DigitalDocument).identifier);
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
          key={file.data.identifier}
          className={`h-14 w-full rounded-lg flex flex-row items-center p-2  hover:cursor-pointer transition overflow-x-visible z-50 hover:bg-primary-foreground`}
        >
          <FileIcon type={"folder"} />

          <div className="flex flex-1 flex-col ml-4 gap-[2px]">
            <div className="text-md md:text-lg font-normal max-w-[221px] sm:max-w-[400px] xl:max-w-[400px] truncate">
              {(file.data as DigitalDocument).name}
            </div>

            <small className="text-sm text-gray-500 font-medium leading-none">
              {(file.data as DigitalDocument).dateCreated && (
                <>
                  {new Date(
                    (file.data as DigitalDocument).dateCreated!
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
                  deleteItem((file.data as DigitalDocument).identifier);
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
