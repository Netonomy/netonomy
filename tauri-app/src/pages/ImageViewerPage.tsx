import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useCollectionStore from "@/stores/useCollectionStore";
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
      <Card className="flex flex-1 w-full overflow-hidden shadow-lg max-h-[calc(100vh-40px)]">
        <CardContent className="w-full flex-1  flex flex-col p-0 relative">
          {/** Document Control Header */}
          <div className="absolute top-0 left-0 right-0 h-[55px] z-40 flex items-center backdrop-blur-xl bg-white/30 dark:bg-black/30 ">
            <Button
              className="m-4 w-10 rounded-full p-0"
              variant={"ghost"}
              onClick={() => {
                navigate(-1);
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

          <div className="w-full flex flex-1 items-center justify-center">
            {file?.blob && (
              <img
                src={URL.createObjectURL(file.blob)}
                className="max-w-full max-h-[calc(100vh-200px)]"
                style={{
                  objectFit: "contain",
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ImageViewerPage;
