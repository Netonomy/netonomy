import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useCollectionStore from "@/stores/useFileStorageStore";
import MyRingLoader from "@/components/MyRingLoader";
import PageContainer from "@/components/PageContainer";
import FileViewerHeader from "@/components/storage/FileViewerHeader";

// PDF VIEWER
import { Viewer } from "@react-pdf-viewer/core";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";

export default function PdfViewerPage() {
  const { did: didInRoute, recordId } = useParams();

  const fetchFile = useCollectionStore((state) => state.actions.fetchFile);
  const file = useCollectionStore((state) => state.file);
  const fetchingFile = useCollectionStore((state) => state.fetchingFile);

  const zoomPluginInstance = zoomPlugin({ enableShortcuts: true });
  const pageNavigationPluginInstance = pageNavigationPlugin();

  useEffect(() => {
    fetchFile(didInRoute!, recordId!);
  }, [didInRoute, recordId]);

  return (
    <PageContainer>
      <FileViewerHeader
        zoomPluginInstance={zoomPluginInstance}
        pageNavigationPluginInstance={pageNavigationPluginInstance}
      />

      <div className="flex flex-1 w-full mt-[55px] overflow-y-auto">
        {file?.blob && (
          <Viewer
            fileUrl={URL.createObjectURL(file.blob)}
            plugins={[zoomPluginInstance, pageNavigationPluginInstance]}
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
