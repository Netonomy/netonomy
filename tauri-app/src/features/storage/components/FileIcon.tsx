import { getFileType } from "@/lib/utils";
import { MyFile } from "@/types/MyFile";
import {
  File,
  FileSpreadsheet,
  FolderIcon,
  ImageIcon,
  VideoIcon,
} from "lucide-react";
import useStorageStore from "../store";

export default function FileIcon({
  type,
  file,
  thumbnailBlob,
}: {
  type: "file" | "folder";
  file?: MyFile;
  thumbnailBlob: Blob | null;
}) {
  const selectedStorageTabDiaply = useStorageStore(
    (state) => state.selectedDisplay
  );

  let style =
    "min-h-[65px] min-w-[65px] max-w-[65px] max-h-[65px] md:min-h-[80px] md:min-w-[80px] md:max-h-[80px] md:max-w-[80px] rounded-sm flex items-center justify-center drop-shadow-md";

  if (selectedStorageTabDiaply === "list")
    style =
      "min-h-[40px] min-w-[40px] max-h-[40px] max-w-[40px] rounded-sm flex items-center justify-center drop-shadow-sm";

  if (type === "folder")
    return (
      <div className={`${style} bg-blue-600`}>
        <FolderIcon className="text-white h-8 w-8" />
      </div>
    );

  switch (getFileType(file?.type || "")) {
    case "pdf":
      if (thumbnailBlob)
        return (
          <div
            className={`${style} flex items-center justify-center overflow-hidden`}
          >
            <img
              src={URL.createObjectURL(thumbnailBlob)}
              className={`${style}`}
            />
          </div>
        );
      return (
        <div className={`${style} bg-red-600`}>
          <div className="text-lg font-semibold text-white">pdf</div>
        </div>
      );
    case "spreadsheet":
      return (
        <div className={`${style} bg-green-600`}>
          <FileSpreadsheet className="text-white h-8 w-8" />
        </div>
      );
    case "video":
      if (thumbnailBlob) {
        return (
          <div
            className={`${style} flex items-center justify-center overflow-hidden`}
          >
            <img
              src={URL.createObjectURL(thumbnailBlob)}
              className={`${style}`}
            />
          </div>
        );
      }
      return (
        <div className={`${style} bg-purple-600`}>
          <VideoIcon className="text-white h-8 w-8" />
        </div>
      );
    case "image":
      if (thumbnailBlob) {
        return (
          <div
            className={`${style} flex items-center justify-center overflow-hidden`}
          >
            <img
              src={URL.createObjectURL(thumbnailBlob)}
              className={`${style}`}
            />
          </div>
        );
      }
      return (
        <div className={`${style} bg-blue-600`}>
          <ImageIcon className="text-white h-8 w-8" />
        </div>
      );

    default:
      return (
        <div className={`${style} bg-blue-600`}>
          <File className="text-white h-8 w-8" />
        </div>
      );
  }
}
