import MyRingLoader from "@/components/MyRingLoader";
import PageContainer from "@/components/PageContainer";
import FileViewerHeader from "@/components/storage/FileViewerHeader";
import useCollectionStore from "@/stores/useFileStorageStore";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

function ImageViewerPage() {
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

      <div className=" flex flex-1 items-center justify-center p-6">
        {fetchingFile && <MyRingLoader />}
        {file?.blob && (
          <img
            src={URL.createObjectURL(file.blob)}
            className="max-w-full max-h-[calc(100vh-200px)] rounded-sm drop-shadow-lg"
          />
        )}
        {!file && !fetchingFile && (
          <div className="text-lg font-semibold">File not found</div>
        )}
      </div>
    </PageContainer>
  );
}

export default ImageViewerPage;
