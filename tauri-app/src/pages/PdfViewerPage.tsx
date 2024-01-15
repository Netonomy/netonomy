import { Button } from "@/components/ui/button";
import { ArrowLeft, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useCollectionStore from "@/stores/useFileStorageStore";
import MyRingLoader from "@/components/MyRingLoader";
import ShareButtonPopover from "@/components/ShareButtonPopover";
import useWeb5Store from "@/stores/useWeb5Store";
import PageContainer from "@/components/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import DownloadButton from "@/components/storage/DownloadButton";
import { Viewer } from "@react-pdf-viewer/core";
import {
  RenderZoomInProps,
  RenderZoomOutProps,
  zoomPlugin,
} from "@react-pdf-viewer/zoom";
import {
  RenderCurrentPageLabelProps,
  pageNavigationPlugin,
} from "@react-pdf-viewer/page-navigation";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";

export default function PdfViewerPage() {
  const navigate = useNavigate();
  const { did: didInRoute, recordId } = useParams();
  const did = useWeb5Store((state) => state.did);
  const fetchFile = useCollectionStore((state) => state.actions.fetchFile);
  const file = useCollectionStore((state) => state.file);
  const fetchingFile = useCollectionStore((state) => state.fetchingFile);
  const zoomPluginInstance = zoomPlugin();
  const { ZoomIn, ZoomOut } = zoomPluginInstance;
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { CurrentPageLabel } = pageNavigationPluginInstance;

  useEffect(() => {
    fetchFile(didInRoute!, recordId!);
  }, [didInRoute, recordId]);

  return (
    <PageContainer>
      {/** Document Control Header */}
      <div className="absolute top-0 left-0 right-0 h-[55px] z-40 flex items-center backdrop-blur-xl bg-white/30 dark:bg-black/30 ">
        <Button
          className="m-4 w-10 rounded-full p-0"
          variant={"ghost"}
          onClick={() => {
            navigate("/");
          }}
        >
          <ArrowLeft />
        </Button>

        <div className="flex flex-col flex-auto">
          {fetchingFile ? (
            <Skeleton className="h-5 w-32 bg-myGrey" />
          ) : (
            <div className="text-lg font-semibold truncate max-w-[calc(100vw-40vw)]">
              {file?.data.name}
            </div>
          )}

          {fetchingFile ? (
            <Skeleton className="h-4 w-16 bg-myGrey mt-1" />
          ) : (
            <CurrentPageLabel>
              {(props: RenderCurrentPageLabelProps) => (
                <p className="text-sm text-muted-foreground">
                  {props.numberOfPages} Pages
                </p>
              )}
            </CurrentPageLabel>
          )}
        </div>

        <div className="flex items-center gap-2 mr-4">
          <div className="flex gap-1">
            <ZoomOut>
              {(props: RenderZoomOutProps) => (
                <Button
                  onClick={props.onClick}
                  variant={"ghost"}
                  className="rounded-full p-2"
                >
                  <ZoomOutIcon />
                </Button>
              )}
            </ZoomOut>
            <ZoomIn>
              {(props: RenderZoomInProps) => (
                <Button
                  onClick={props.onClick}
                  variant={"ghost"}
                  className="rounded-full p-2"
                >
                  <ZoomInIcon />
                </Button>
              )}
            </ZoomIn>
          </div>

          <DownloadButton />

          {did === file?.record.author && <ShareButtonPopover />}
        </div>
      </div>

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
