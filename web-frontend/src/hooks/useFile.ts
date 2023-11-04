import { useContext, useEffect, useState } from "react";
import { DigitalDocument } from "./useFiles";
import Web5Context from "@/Web5Provider";

export default function useFile(recordId: string) {
  const [file, setFile] = useState<DigitalDocument | null>(null);
  const [blob, setBlob] = useState<null | Blob>(null);
  const web5Context = useContext(Web5Context);

  async function fetchFile() {
    if (web5Context.web5) {
      const { record } = await web5Context.web5.dwn.records.read({
        message: {
          recordId,
        },
      });

      const data = await record.data.json();

      setFile(data);

      const { record: blobRecord } = await web5Context.web5.dwn.records.read({
        message: {
          recordId: data.url,
        },
      });

      const fileBlob = await blobRecord.data.blob();
      setBlob(fileBlob);
    }
  }

  useEffect(() => {
    fetchFile();
  }, [web5Context]);

  return { file, blob };
}
