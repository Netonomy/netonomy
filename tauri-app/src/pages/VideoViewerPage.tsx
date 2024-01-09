import MyRingLoader from "@/components/MyRingLoader";
import PageContainer from "@/components/PageContainer";
import ShareButtonPopover from "@/components/ShareButtonPopover";
import { Button } from "@/components/ui/button";
import useCollectionStore from "@/stores/useFileStorageStore";
import useWeb5Store from "@/stores/useWeb5Store";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";

export default function VideoPlayerPage() {
  const navigate = useNavigate();
  const { did: didInRoute, recordId } = useParams();
  const did = useWeb5Store((state) => state.did);
  const fetchFile = useCollectionStore((state) => state.actions.fetchFile);
  const file = useCollectionStore((state) => state.file);

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
          <div className="text-lg font-semibold truncate  max-w-[calc(100vw-40vw)]">
            {file?.data.name}
          </div>
        </div>

        {did === file?.record.author && <ShareButtonPopover />}
      </div>

      <div className="flex flex-1 w-full  m-12 mt-[75px] rounded-lg overflow-hidden flex-col items-center justify-center dark:bg-black relative">
        {file ? (
          <ReactPlayer
            url={URL.createObjectURL(file.blob)}
            width={"100%"}
            height={"100%"}
            style={{
              borderRadius: "20px",
              zIndex: 10,
            }}
            controls
          />
        ) : (
          <MyRingLoader />
        )}
      </div>
    </PageContainer>
  );
}
