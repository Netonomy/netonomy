import { Button } from "@/components/ui/button";
import useCollectionStore from "@/stores/useFileStorageStore";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ImageViewerPage() {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const fetchFile = useCollectionStore((state) => state.actions.fetchFile);
  const file = useCollectionStore((state) => state.file);

  useEffect(() => {
    fetchFile(recordId!);
  }, []);

  return (
    <div className="h-screen w-screen p-10 flex">
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
          <div className="text-lg font-semibold truncate max-w-[calc(100vw-30vw)]">
            {file?.data.name}
          </div>
        </div>
      </div>

      <div className=" flex flex-1 items-center justify-center">
        {file?.blob && (
          <img
            src={URL.createObjectURL(file.blob)}
            className="max-w-full max-h-[calc(100vh-200px)] rounded-sm"
          />
        )}
      </div>
    </div>
  );
}

export default ImageViewerPage;
