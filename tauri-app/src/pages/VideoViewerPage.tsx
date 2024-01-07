"use client";
import MyRingLoader from "@/components/MyRingLoader";
import useCollectionStore from "@/stores/useFileStorageStore";
import { useEffect } from "react";
import ReactPlayer from "react-player";
import { useParams } from "react-router-dom";

export default function VideoPlayerPage() {
  const { recordId } = useParams();
  const fetchFile = useCollectionStore((state) => state.actions.fetchFile);
  const file = useCollectionStore((state) => state.file);

  useEffect(() => {
    fetchFile(recordId!);
  }, []);

  return (
    <div className="h-screen w-screen p-10 flex">
      <div className="flex flex-1 w-full bg-white rounded-lg overflow-hidden  flex-col items-center justify-center dark:bg-black relative">
        {file ? (
          <ReactPlayer
            url={URL.createObjectURL(file.blob)}
            height={"100%"}
            width={"100%"}
            controls
          />
        ) : (
          <MyRingLoader />
        )}
      </div>
    </div>
  );
}
