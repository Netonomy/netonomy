import { Button } from "@/components/ui/button";
import { ArrowLeft, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { pdfjs } from "react-pdf";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { Document, Page } from "react-pdf";
import { RingLoader } from "react-spinners";
import useCollectionStore from "@/stores/useFileStorageStore";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import MyRingLoader from "@/components/MyRingLoader";
import ShareButtonPopover from "@/components/ShareButtonPopover";
import useWeb5Store from "@/stores/useWeb5Store";
import PageContainer from "@/components/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
// Set the worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export default function PdfViewerPage() {
  const navigate = useNavigate();
  const { did: didInRoute, recordId } = useParams();
  const did = useWeb5Store((state) => state.did);
  const [numPages, setNumPages] = useState<number>();
  const [scale, setScale] = useState<number>(1);
  const fetchFile = useCollectionStore((state) => state.actions.fetchFile);
  const file = useCollectionStore((state) => state.file);
  const fetchingFile = useCollectionStore((state) => state.fetchingFile);

  /**
   * Callback function for when the PDF document is successfully loaded.
   * @param {Object} data - The data object containing the number of pages.
   */
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  /**
   * Increase the scale of the PDF document by 0.1.
   */
  function zoomIn() {
    setScale((prevScale) => prevScale + 0.1);
  }

  /**
   * Decrease the scale of the PDF document by 0.1.
   */
  function zoomOut() {
    setScale((prevScale) => prevScale - 0.1);
  }

  useEffect(() => {
    fetchFile(didInRoute!, recordId!);
  }, []);

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

        <div className="flex flex-col flex-auto  ">
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
            <p className="text-sm text-muted-foreground">{numPages} Pages</p>
          )}
        </div>

        <div className="flex gap-1">
          <Button
            onClick={zoomOut}
            variant={"ghost"}
            className="rounded-full p-2"
          >
            <ZoomOutIcon />
          </Button>

          <Button
            onClick={zoomIn}
            variant={"ghost"}
            className="rounded-full p-2"
          >
            <ZoomInIcon />
          </Button>
        </div>

        {did === file?.record.author && <ShareButtonPopover />}
      </div>

      {file?.blob && (
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <Document
              file={URL.createObjectURL(file.blob)}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div
                  className="flex items-center justify-center"
                  style={{ height, width }}
                >
                  <RingLoader
                    className="absolute z-30 top-0 left-0 right-0 "
                    loading
                  />
                </div>
              }
            >
              <List
                height={height}
                itemCount={numPages || 0}
                itemSize={height}
                width={width}
                // onScroll={({ scrollOffset }: { scrollOffset: any }) => {
                // //   const pageNumber =
                // //     Math.floor(scrollOffset / height) + 1;

                //   // setDisplayedPage(pageNumber);
                // }}
              >
                {({ index, style }: { index: number; style: any }) => (
                  <div
                    style={{
                      ...style,
                      display: "flex",
                      justifyContent: "center",
                      paddingTop: "60px",
                      transform: `scale(${scale})`,
                    }}
                  >
                    <Page key={index} pageNumber={index + 1} height={height} />
                  </div>
                )}
              </List>
            </Document>
          )}
        </AutoSizer>
      )}
      <div className="h-full w-full items-center flex justify-center">
        {fetchingFile && <MyRingLoader />}
        {!file && !fetchingFile && (
          <div className="text-lg font-semibold">File not found</div>
        )}
      </div>
    </PageContainer>
  );
}
