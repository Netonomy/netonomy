import { useParams } from "react-router-dom";
import { useFileQuery } from "@/features/storage/hooks";
import ReactPlayer from "react-player";

export default function VideoViwer() {
  const { did: didInRoute, recordId } = useParams();
  const fileQuery = useFileQuery(didInRoute!, recordId!);

  return (
    <div className="flex flex-1 w-full p-10 rounded-lg overflow-hidden flex-col items-center justify-center dark:bg-black relative">
      {fileQuery.data && (
        <ReactPlayer
          url={URL.createObjectURL(fileQuery.data.fileBlob)}
          width={"auto"}
          height={"100%"}
          style={{
            borderRadius: "12px",
            zIndex: 10,
            overflow: "hidden",
            background: "black",
            position: "relative",
            boxShadow: "0 0 6px rgba(0,0,0,0.5)",
          }}
          controls
        />
      )}
    </div>
  );
}
