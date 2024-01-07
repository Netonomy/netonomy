import useStorageStore, { DigitalDocument } from "@/stores/useFileStorageStore";
import { useEffect, useState } from "react";

export default function FileThumbnail({ file }: { file: DigitalDocument }) {
  const fetchBlob = useStorageStore((state) => state.actions.fetchBlob);
  const [thumbnail, setThumbnail] = useState<Blob | undefined>(undefined);

  async function fetchThumbnail() {
    if (file.thumbnailBlobId) {
      const thumnail = await fetchBlob(file.thumbnailBlobId);
      if (thumnail) setThumbnail(thumnail);
    }
  }

  useEffect(() => {
    fetchThumbnail();
  }, []);

  return (
    <div className="min-h-[45px] min-w-[45px] md:min-h-[60px] md:min-w-[60px] rounded-lg flex items-center justify-center overflow-hidden">
      {thumbnail && (
        <img
          src={URL.createObjectURL(thumbnail)}
          className="max-h-full max-w-full"
        />
      )}
    </div>
  );
}
