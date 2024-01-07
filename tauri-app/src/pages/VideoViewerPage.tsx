"use client";
import MyRingLoader from "@/components/MyRingLoader";
import { Button } from "@/components/ui/button";
import useCollectionStore from "@/stores/useFileStorageStore";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";

export default function VideoPlayerPage() {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const fetchFile = useCollectionStore((state) => state.actions.fetchFile);
  const file = useCollectionStore((state) => state.file);

  useEffect(() => {
    fetchFile(recordId!);
  }, []);

  return (
    <div className="h-screen w-screen relative flex">
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
          <div className="text-lg font-semibold truncate">
            {file?.data.name}
          </div>
        </div>
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
    </div>
  );
}
