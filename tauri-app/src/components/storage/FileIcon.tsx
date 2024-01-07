import useStorageStore, {
  DigitalDocument,
  selectedStorageDisplayTabAtom,
} from "@/stores/useFileStorageStore";
import { useAtom } from "jotai/react";
import {
  File,
  FileSpreadsheet,
  FolderIcon,
  ImageIcon,
  VideoIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

const cachedThumbnails = new Map<string, Blob>();

export default function FileIcon({
  type,
  file,
}: {
  type: "file" | "folder";
  file?: DigitalDocument;
}) {
  const fetchBlob = useStorageStore((state) => state.actions.fetchBlob);
  const [thumbnail, setThumbnail] = useState<Blob | undefined>(undefined);
  const [selectedStorageTabDiaply] = useAtom(selectedStorageDisplayTabAtom);

  async function fetchThumbnail() {
    if (file?.thumbnailBlobId) {
      if (cachedThumbnails.has(file.thumbnailBlobId)) {
        setThumbnail(cachedThumbnails.get(file.thumbnailBlobId));
        return;
      }

      const thumnail = await fetchBlob(file.thumbnailBlobId);
      if (thumnail) {
        setThumbnail(thumnail);

        cachedThumbnails.set(file.thumbnailBlobId, thumnail);
      }
    } else if (
      file?.fileBlobId &&
      (file?.encodingFormat === "image/jpeg" ||
        file?.encodingFormat === "image/png" ||
        file?.encodingFormat === "image/gif" ||
        file?.encodingFormat === "image/webp" ||
        file?.encodingFormat === "image/svg+xml" ||
        file?.encodingFormat === "image/bmp" ||
        file?.encodingFormat === "image/tiff" ||
        file?.encodingFormat === "image/x-icon")
    ) {
      if (cachedThumbnails.has(file?.fileBlobId)) {
        setThumbnail(cachedThumbnails.get(file?.fileBlobId));
        return;
      }

      const thumnail = await fetchBlob(file?.fileBlobId);
      if (thumnail) {
        setThumbnail(thumnail);

        cachedThumbnails.set(file?.fileBlobId, thumnail);
      }
    }
  }

  useEffect(() => {
    fetchThumbnail();
  }, []);

  let style =
    "min-h-[65px] min-w-[65px] max-h-[65px] md:min-h-[80px] md:min-w-[80px] md:max-h-[80px] md:max-w-[80px]  rounded-lg flex items-center justify-center";

  if (selectedStorageTabDiaply === "list")
    style =
      "min-h-[60px] min-w-[60px] max-h-[60px] max-w-[60px] rounded-sm flex items-center justify-center";

  if (type === "folder")
    return (
      <div className={`${style} bg-blue-600`}>
        <FolderIcon className="text-white" />
      </div>
    );

  switch (file?.encodingFormat) {
    case "application/pdf":
      if (thumbnail)
        return (
          <div
            className={`${style} flex items-center justify-center overflow-hidden`}
          >
            <img src={URL.createObjectURL(thumbnail)} className={`${style}`} />
          </div>
        );
      return (
        <div className={`${style} bg-red-600`}>
          <div className="text-lg font-semibold text-white">pdf</div>
        </div>
      );
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return (
        <div className={`${style} bg-green-600`}>
          <FileSpreadsheet className="text-white" />
        </div>
      );
    case "video/quicktime":
    case "video/mp4":
    case "application/x-mpegURL":
    case "video/x-flv":
    case "video/MP2T":
    case "video/x-msvideo":
    case "video/x-ms-wmv":
      if (thumbnail) {
        return (
          <div
            className={`${style} flex items-center justify-center overflow-hidden`}
          >
            <img src={URL.createObjectURL(thumbnail)} className={`${style}`} />
          </div>
        );
      }
      return (
        <div className={`${style} bg-purple-600`}>
          <VideoIcon className="text-white" />
        </div>
      );
    case "image/jpeg":
    case "image/png":
    case "image/gif":
    case "image/webp":
    case "image/svg+xml":
    case "image/bmp":
    case "image/tiff":
    case "image/x-icon":
      if (thumbnail) {
        return (
          <div
            className={`${style} flex items-center justify-center overflow-hidden`}
          >
            <img src={URL.createObjectURL(thumbnail)} className={`${style}`} />
          </div>
        );
      }
      return (
        <div className={`${style} bg-blue-600`}>
          <ImageIcon className="text-white" />
        </div>
      );

    default:
      return (
        <div className={`${style} bg-blue-600`}>
          <File className="text-white" />
        </div>
      );
  }
}
