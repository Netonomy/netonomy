import { Input } from "@/components/ui/input";
import InlineEdit from "@/components/ui/InlineEdit";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import DownloadButton from "@/components/storage/DownloadButton";
import ShareButtonPopover from "@/components/ShareButtonPopover";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import useWeb5Store from "@/stores/useWeb5Store";
import useStorageStore from "@/stores/useFileStorageStore";

import {
  RenderZoomInProps,
  RenderZoomOutProps,
  ZoomPlugin,
} from "@react-pdf-viewer/zoom";
import {
  PageNavigationPlugin,
  RenderCurrentPageLabelProps,
} from "@react-pdf-viewer/page-navigation";

export default function FileViewerHeader({
  zoomPluginInstance,
  pageNavigationPluginInstance,
}: {
  zoomPluginInstance?: ZoomPlugin;
  pageNavigationPluginInstance?: PageNavigationPlugin;
}) {
  const navigate = useNavigate();
  const file = useStorageStore((state) => state.file);
  const fetchingFile = useStorageStore((state) => state.fetchingFile);
  const did = useWeb5Store((state) => state.did);
  const updateFile = useStorageStore((state) => state.actions.updateFileItem);

  const [editing, setEditing] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileNameRef = useRef(fileName);

  useEffect(() => {
    if (file?.data) {
      setFileName(file.data.name);
      fileNameRef.current = file.data.name;
    }
  }, [file?.data]);

  return (
    <div className="absolute top-0 left-0 right-0 h-[60px] z-40 flex items-center backdrop-blur-xl  dark:bg-black/30 ">
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
        {fetchingFile ? (
          <Skeleton className="h-5 w-32 bg-myGrey" />
        ) : (
          <div className="max-w-[calc(100vw-40vw)] ">
            <InlineEdit
              editing={editing}
              setEditing={setEditing}
              editView={
                <Input
                  autoFocus
                  value={fileName}
                  onChange={(e) => {
                    setFileName(e.target.value);
                    fileNameRef.current = e.target.value;
                  }}
                  onFocus={(e) => {
                    // Highlight filename without extension
                    const dotIndex = e.target.value.indexOf(".");
                    if (dotIndex !== -1) {
                      e.target.setSelectionRange(0, dotIndex);
                    }
                  }}
                />
              }
              readView={
                <div className="text-lg font-semibold truncate h-ful">
                  {fileName}
                </div>
              }
              onConfirm={() => {
                if (file?.data.name === fileNameRef.current) return;
                if (file) {
                  const data = {
                    ...file.data,
                    name: fileNameRef.current,
                  };
                  updateFile(file.record.id, data, file.record.published);
                }
              }}
            />
          </div>
        )}

        {pageNavigationPluginInstance && (
          <>
            {fetchingFile ? (
              <Skeleton className="h-4 w-16 bg-myGrey mt-1" />
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
