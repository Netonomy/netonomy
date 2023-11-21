import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useChatStore from "@/hooks/stores/useChatStore";
import useCollectionStore from "@/hooks/stores/useCollectionStore";
import { RingLoader } from "react-spinners";

export default function ImageViewer() {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const setRecordId = useChatStore((state) => state.actions.setRecordId);
  const fetchFile = useCollectionStore((state) => state.actions.fetchFile);
  const file = useCollectionStore((state) => state.file);
  const fetching = useCollectionStore((state) => state.fetchingFile);

  useEffect(() => {
    setRecordId(recordId!);
    fetchFile(recordId!);

    return () => {
      setRecordId(null);
    };
  }, [recordId]);

  return (
    <div className="h-screen w-screen p-14">
      <div className="flex flex-1 w-full flex-row items-center gap-6 h-full">
        <div className="flex-grow h-full flex flex-col items-center max-h-[calc(100vh-40px)]">
          <Card className="flex flex-1 w-full overflow-hidden shadow-lg">
            <CardContent className="w-full h-full overflow-y-auto flex flex-col p-0 relative items-center justify-center">
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

              <div className="h-full w-full flex items-center justify-center">
                {!fetching ? (
                  <>
                    {file?.blob && (
                      <img
                        src={URL.createObjectURL(file.blob)}
                        alt="file"
                        style={{
                          objectFit: "scale-down",
                          height: "100%",
                          width: "100%",
                        }}
                      />
                    )}
                  </>
                ) : (
                  <RingLoader loading />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
