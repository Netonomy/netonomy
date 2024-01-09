import MyRingLoader from "@/components/MyRingLoader";
import PageContainer from "@/components/PageContainer";
import ShareButtonPopover from "@/components/ShareButtonPopover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useCollectionStore from "@/stores/useFileStorageStore";
import useWeb5Store from "@/stores/useWeb5Store";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ImageViewerPage() {
  const navigate = useNavigate();
  const { did: didInRoute, recordId } = useParams();
  const did = useWeb5Store((state) => state.did);
  const fetchFile = useCollectionStore((state) => state.actions.fetchFile);
  const file = useCollectionStore((state) => state.file);
  const fetchingFile = useCollectionStore((state) => state.fetchingFile);

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

        {fetchingFile ? (
          <Skeleton className="h-5 w-32 bg-myGrey" />
        ) : (
          <div className="flex flex-col flex-auto  ">
            <div className="text-lg font-semibold truncate max-w-[calc(100vw-30vw)]">
              {file?.data.name}
            </div>
          </div>
        )}

        {did === file?.record.author && <ShareButtonPopover />}
      </div>

      <div className=" flex flex-1 items-center justify-center p-6">
        {fetchingFile && <MyRingLoader />}
        {file?.blob && (
          <img
            src={URL.createObjectURL(file.blob)}
            className="max-w-full max-h-[calc(100vh-200px)] rounded-sm"
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
