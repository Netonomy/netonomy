import MyRingLoader from "@/components/MyRingLoader";
import PageContainer from "@/components/PageContainer";
import FileViewerHeader from "@/components/storage/FileViewerHeader";
import useCollectionStore from "@/stores/useFileStorageStore";
import { useEffect } from "react";
import ReactPlayer from "react-player";
import { useParams } from "react-router-dom";

export default function VideoPlayerPage() {
  const { did: didInRoute, recordId } = useParams();
  const fetchFile = useCollectionStore((state) => state.actions.fetchFile);
  const file = useCollectionStore((state) => state.file);
  const fetchingFile = useCollectionStore((state) => state.fetchingFile);

  useEffect(() => {
    fetchFile(didInRoute!, recordId!);
  }, []);

  return (
    <PageContainer>
      <FileViewerHeader />

      <div className="flex flex-1 w-full p-10 mt-[45px] rounded-lg overflow-hidden flex-col items-center justify-center dark:bg-black relative">
        {fetchingFile && <MyRingLoader />}
        {file && (
          <ReactPlayer
            url={URL.createObjectURL(file.blob)}
            width={"auto"}
            height={"100%"}
            style={{
              borderRadius: "12px",
              zIndex: 10,
              overflow: "hidden",
              background: "black",
              position: "relative",
              boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            }}
            controls
          />
        )}
        {!file && !fetchingFile && (
          <div className="text-lg font-semibold">File not found</div>
        )}
      </div>
    </PageContainer>
  );
}
