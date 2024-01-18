import { Input } from "@/components/ui/input";
import InlineEdit from "@/components/ui/InlineEdit";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import DownloadButton from "@/features/storage/components/DownloadButton";
import ShareButtonPopover from "@/features/storage/components/ShareButtonPopover";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import useWeb5Store from "@/features/app/useWeb5Store";
import { RenderZoomInProps, RenderZoomOutProps } from "@react-pdf-viewer/zoom";
import { RenderCurrentPageLabelProps } from "@react-pdf-viewer/page-navigation";
import { useFileQuery, useUpdateFileInfoMutation } from "../hooks";
import { MyFile } from "@/types/MyFile";
import useStorageStore from "../store";

export default function FileViewerHeader() {
  const navigate = useNavigate();
  const { did: didInRoute, recordId } = useParams();
  const did = useWeb5Store((state) => state.did);
  const updateFileMutation = useUpdateFileInfoMutation();
  const [fileName, setFileName] = useState("");

  const pageNavigationPluginInstance = useStorageStore(
    (state) => state.pdfNavigationPlugin
  );
  const zoomPluginInstance = useStorageStore((state) => state.pdfZoomPlugin);

  const {
    data: file,
    isLoading,
    isFetching,
  } = useFileQuery(didInRoute!, recordId!);

  useEffect(() => {
    if (file?.data) {
      setFileName(file.data.name);
    }
  }, [isFetching]);

  return (
    <div className="absolute top-0 left-0 right-0 h-[65px] z-40 flex items-center backdrop-blur-md">
      <Button
        className="m-4 w-10 rounded-full p-0"
        variant={"ghost"}
        onClick={() => {
          navigate("/");
        }}
      >
        <ArrowLeft />
      </Button>

      <div className="flex flex-col justify-center flex-auto">
        {isLoading ? (
          <Skeleton className="h-5 w-32" />
        ) : (
          <div className="max-w-[calc(100vw-40vw)] ">
            {did === file?.record.author ? (
              <InlineEdit
                defaultValue={fileName}
                editView={({ fieldProps }) => (
                  <Input
                    {...fieldProps}
                    autoFocus
                    onFocus={(e) => {
                      // Highlight filename without extension
                      const dotIndex = e.target.value.indexOf(".");
                      if (dotIndex !== -1) {
                        e.target.setSelectionRange(0, dotIndex);
                      }
                    }}
                  />
                )}
                readView={
                  <div className="text-lg font-semibold truncate h-ful">
                    {fileName}
                  </div>
                }
                onConfirm={(value) => {
                  setFileName(value);

                  if (file?.data.name === value) return;
                  if (file) {
                    const newFileInfo: MyFile = {
                      ...file.data,
                      name: value,
                    };

                    updateFileMutation.mutate({
                      record: file.record,
                      newFileInfo,
                      publish: file.record.published,
                    });
                  }
                }}
              />
            ) : (
              <div className="text-lg font-semibold truncate h-ful">
                {fileName}
              </div>
            )}
          </div>
        )}

        {pageNavigationPluginInstance && (
          <>
            {isLoading ? (
              <Skeleton className="h-4 w-16 mt-1" />
            ) : (
              <pageNavigationPluginInstance.CurrentPageLabel>
                {(props: RenderCurrentPageLabelProps) => (
                  <p className="text-sm text-muted-foreground ml-1">
                    {props.numberOfPages} Pages
                  </p>
                )}
              </pageNavigationPluginInstance.CurrentPageLabel>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2 mr-4">
        {zoomPluginInstance && (
          <div className="flex gap-1">
            <zoomPluginInstance.ZoomOut>
              {(props: RenderZoomOutProps) => (
                <Button
                  onClick={props.onClick}
                  variant={"ghost"}
                  className="rounded-full p-2"
                >
                  <ZoomOutIcon />
                </Button>
              )}
            </zoomPluginInstance.ZoomOut>
            <zoomPluginInstance.ZoomIn>
              {(props: RenderZoomInProps) => (
                <Button
                  onClick={props.onClick}
                  variant={"ghost"}
                  className="rounded-full p-2"
                >
                  <ZoomInIcon />
                </Button>
              )}
            </zoomPluginInstance.ZoomIn>
          </div>
        )}

        <DownloadButton />

        {did === file?.record.author && <ShareButtonPopover />}
      </div>
    </div>
  );
}
