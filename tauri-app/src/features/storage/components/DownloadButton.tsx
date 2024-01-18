import { Download } from "lucide-react";
import { Button } from "../../../components/ui/button";
import useStorageStore from "../store";

export default function DownloadButton() {
  const file = useStorageStore((state) => state.fileInView);

  const downloadFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      size={"icon"}
      onClick={() => {
        if (!file) return;

        downloadFile(file.blob, file.data.name);
      }}
      className="h-9 w-9"
    >
      <Download className="h-4 w-4 text-ine" />
    </Button>
  );
}
