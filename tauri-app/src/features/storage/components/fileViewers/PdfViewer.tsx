import { useParams } from "react-router-dom";
import MyRingLoader from "@/components/MyRingLoader";
import { useFileQuery } from "@/features/storage/hooks";

// PDF VIEWER
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import { Viewer } from "@react-pdf-viewer/core";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import useStorageStore from "../../store";
import { useEffect } from "react";

export default function PdfViewer() {
  const { did: didInRoute, recordId } = useParams();
  const fileQuery = useFileQuery(didInRoute!, recordId!);

  const zoomPluginInstance = zoomPlugin({ enableShortcuts: true });
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const setPdfPlugins = useStorageStore((state) => state.setPdfPlugins);

  useEffect(() => {
    setPdfPlugins(zoomPluginInstance, pageNavigationPluginInstance);

    return () => {
      setPdfPlugins(null, null);
    };
  }, []);

  return (
    <>
      {fileQuery.data?.fileBlob && (
        <Viewer
          fileUrl={URL.createObjectURL(fileQuery.data?.fileBlob)}
          plugins={[zoomPluginInstance, pageNavigationPluginInstance]}
          renderLoader={(_: number) => <MyRingLoader />}
        />
      )}
    </>
  );
}
