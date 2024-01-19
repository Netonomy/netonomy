import { useParams } from "react-router-dom";
import { useFileQuery } from "@/features/storage/hooks";

export default function ImageViewer() {
  const { did: didInRoute, recordId } = useParams();
  const fileQuery = useFileQuery(didInRoute!, recordId!);

  return (
    <>
      {fileQuery.data?.fileBlob && (
        <div className="flex flex-1 items-center justify-center p-6">
          <img
            src={URL.createObjectURL(fileQuery.data?.fileBlob)}
            className="max-w-full max-h-[calc(100vh-200px)] rounded-sm drop-shadow-lg"
          />
        </div>
      )}
    </>
  );
}
