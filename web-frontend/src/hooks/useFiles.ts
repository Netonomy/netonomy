import Web5Context from "@/Web5Provider";
import { loadingAtom } from "@/state/loadingAtom";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useContext, useEffect } from "react";
import axios from "axios";

// Atoms
const filesAtom = atomWithStorage<DigitalDocument[]>("files", []);

export default function useFiles() {
  const web5Context = useContext(Web5Context);
  const [files, setFiles] = useAtom(filesAtom);
  const [, setLoading] = useAtom(loadingAtom);

  async function uploadFiles(files: FileList) {
    if (web5Context) {
      setLoading(true);
      for (var i = 0; i < files.length; i++) {
        // Convert file to blob
        const blob = new Blob([files[0]], {
          type: files[0].type,
        });

        // Upload image to blob store
        const blobResult = await web5Context.dwn.records.create({
          data: blob,
        });

        let data: DigitalDocument = {
          "@context": "https://schema.org",
          "@type": "DigitalDocument",
          name: files[i].name,
          encodingFormat: files[i].type,
          size: files[i].size.toString(),
          datePublished: new Date().toISOString(),
          identifier: "",
          url: blobResult.record!.id,
        };

        // Upload as File Object: https://schema.org/DigitalDocument
        const fileObjectRes = await web5Context.dwn.records.create({
          data: data,
          message: {
            schema: "https://schema.org/DigitalDocument",
          },
        });

        if (fileObjectRes.record) data.identifier = fileObjectRes.record?.id;

        // upload to chroma
        const formData = new FormData();
        formData.append("file", blob);
        formData.append("did", web5Context.agent.agentDid || "");
        formData.append("recordId", fileObjectRes.record!.id);

        // Upload to chroma
        await axios.post(
          "http://localhost:3000/api/chroma/uploadFile",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setFiles((prevDocs: DigitalDocument[]) => [data, ...prevDocs]);
      }
      setLoading(false);
    }
  }

  async function fetchFiles() {
    if (web5Context) {
      const { records } = await web5Context.dwn.records.query({
        message: {
          filter: {
            schema: "https://schema.org/DigitalDocument",
          },
        },
      });

      if (!records) return;
      let files: DigitalDocument[] = [];
      for (var i = 0; i < records.length; i++) {
        const record = records[i];
        let data = await record.data.json();

        data.identifier = record.id;

        // Get the file blob
        const blob = await web5Context.dwn.records.read({
          message: {
            recordId: data.url,
          },
        });

        const file = await blob.record.data.blob();

        data.url = URL.createObjectURL(file);

        files.push(data);
      }
      // Revert the
      files.reverse();
      setFiles(files);
    }
  }

  async function deleteFile(recordId: string) {
    if (web5Context) {
      setLoading(true);
      await web5Context.dwn.records.delete({
        message: {
          recordId: recordId,
        },
      });
      setFiles((prevDocs: DigitalDocument[]) =>
        prevDocs.filter((doc) => doc.identifier !== recordId)
      );
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFiles();
  }, [web5Context]);

  return { uploadFiles, files, deleteFile };
}

// Types

export type DigitalDocument = {
  "@context": "https://schema.org";
  "@type": "DigitalDocument";
  name: string;
  encodingFormat: string;
  size: string;
  url: string;
  identifier: string;
  dateCreated?: string;
  dateModified?: string;
  datePublished: string;
  thumbnail?: Blob;
  thumbnailUrl?: string;
};
