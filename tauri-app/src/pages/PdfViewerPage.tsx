import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useCollectionStore from "@/stores/useFileStorageStore";
import MyRingLoader from "@/components/MyRingLoader";
import PageContainer from "@/components/PageContainer";

// PDF VIEWER
import { Viewer } from "@react-pdf-viewer/core";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";
import FileViewerHeader from "@/components/storage/FileViewerHeader";

export default function PdfViewerPage() {
  const { did: didInRoute, recordId } = useParams();

  const fetchFile = useCollectionStore((state) => state.actions.fetchFile);
  const file = useCollectionStore((state) => state.file);
  const fetchingFile = useCollectionStore((state) => state.fetchingFile);

  const zoomPluginInstance = zoomPlugin();

  useEffect(() => {
    fetchFile(didInRoute!, recordId!);
  }, [didInRoute, recordId]);

  return (
    <PageContainer>
      <FileViewerHeader zoomPluginInstance={zoomPluginInstance} />

      <div className="flex flex-1 w-full mt-[55px] overflow-y-auto">
        {file?.blob && (
          <Viewer
            fileUrl={URL.createObjectURL(file.blob)}
            plugins={[zoomPluginInstance]}
            renderLoader={(_: number) => <MyRingLoader />}
          />
        )}

        {fetchingFile && (
          <div className="flex flex-1 items-center justify-center">
            <MyRingLoader />
          </div>
        )}
        {!file && !fetchingFile && (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-lg font-semibold">File not found</div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
