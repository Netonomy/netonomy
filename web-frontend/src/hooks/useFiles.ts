import Web5Context from "@/Web5Provider";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useContext, useEffect } from "react";
import axios from "axios";
import useLoadingStore from "./stores/useLoadingStore";

// Atoms
export const filesAtom = atomWithStorage<(DigitalDocument | Folder)[]>(
  "files",
  []
);

export default function useFolder(folderId?: string) {
  const web5Context = useContext(Web5Context);
  const [files, setFiles] = useAtom(filesAtom);
  const setLoading = useLoadingStore((state) => state.setLoading);

  async function uploadFiles(files: FileList, folderId?: string) {
    if (web5Context.web5 && web5Context.did) {
      console.log(`Uploading ${files.length} files...`);
      setLoading(true);
      for (var i = 0; i < files.length; i++) {
        // Convert file to blob
        const blob = new Blob([files[0]], {
          type: files[0].type,
        });

        // Upload image to blob store
        const blobResult = await web5Context.web5.dwn.records.create({
          data: blob,
        });

        let data: DigitalDocument = {
          "@context": "https://schema.org",
          "@type": "DigitalDocument",
          name: files[i].name,
          encodingFormat: files[i].type,
          size: files[i].size.toString(),
          datePublished: new Date().toISOString(),
          dateCreated: new Date().toISOString(),
          identifier: "",
          url: blobResult.record!.id,
        };

        console.log(`Folder id: ${folderId}`);

        // Upload as File Object: https://schema.org/DigitalDocument
        const fileObjectRes = await web5Context.web5.dwn.records.create({
          data: data,
          message: {
            schema: "https://schema.org/DigitalDocument",
            parentId: folderId,
          },
        });

        if (fileObjectRes.record) data.identifier = fileObjectRes.record?.id;

        // upload to chroma
        const formData = new FormData();
        formData.append("file", blob);
        formData.append("did", web5Context.did);
        formData.append("recordId", fileObjectRes.record!.id);

        // Upload to chroma
        await axios
          .post("http://localhost:3000/api/chroma/uploadFile", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .catch((err) => {
            console.error(err);
          });

        setFiles((prevDocs: (DigitalDocument | Folder)[]) => [
          data,
          ...prevDocs,
        ]);
      }
      setLoading(false);
    }
  }

  async function createFolder(name: string) {
    if (!web5Context.web5) return;

    let data: Folder = {
      "@context": "https://schema.org",
      "@type": "Collection",
      name,
      identifier: "",
      dateCreated: new Date().toISOString(),
    };

    const { record } = await web5Context.web5.dwn.records.create({
      data,
      message: {
        schema: "https://schema.org/Collection",
        parentId: folderId,
        contextId: folderId,
      },
    });

    console.log(`Created folder: ${record?.id}`);

    // Add the folder to the files and folders array
    if (record) {
      console.log(`Updating files...`);
      data.identifier = record.id;
      setFiles((prevFiles) => [data, ...prevFiles]);
    }
  }

  async function fetchFilesAndFolders() {
    if (web5Context.web5) {
      let filesAndFolders: (DigitalDocument | Folder)[] = [];

      // Fetch the folders
      const { records } = await web5Context.web5.dwn.records.query({
        message: {
          filter: {
            parentId: folderId,
            schema: "https://schema.org/Collection",
          },
        },
      });

      if (!records) return;

      for (var i = 0; i < records.length; i++) {
        const record = records[i];
        let data = await record.data.json();

        data.identifier = record.id;

        // Add the folder to the files and folders array
        filesAndFolders.push(data);
      }

      // Fetch the files
      const { records: fileRecords } = await web5Context.web5.dwn.records.query(
        {
          message: {
            filter: {
              parentId: folderId,
              schema: "https://schema.org/DigitalDocument",
            },
          },
        }
      );

      if (!fileRecords) return;
      for (var i = 0; i < fileRecords.length; i++) {
        const record = fileRecords[i];
        let data = await record.data.json();

        data.identifier = record.id;

        // Get the file blob
        const blob = await web5Context.web5.dwn.records.read({
          message: {
            recordId: data.url,
          },
        });

        const file = await blob.record.data.blob();

        data.url = URL.createObjectURL(file);

        // Add the file to the files and folders array
        filesAndFolders.push(data);
      }

      // Order the files by most recent dateCreated
      filesAndFolders = filesAndFolders.sort((a, b) => {
        return (
          new Date(b.dateCreated!).getTime() -
          new Date(a.dateCreated!).getTime()
        );
      });

      setFiles(filesAndFolders);
    }
  }

  async function deleteFile(recordId: string) {
    if (web5Context.web5) {
      setLoading(true);
      await web5Context.web5.dwn.records.delete({
        message: {
          recordId: recordId,
        },
      });
      setFiles((prevDocs: (DigitalDocument | Folder)[]) =>
        prevDocs.filter((doc) => doc.identifier !== recordId)
      );
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFilesAndFolders();
  }, [web5Context, folderId]);

  return { uploadFiles, files, deleteFile, createFolder };
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

export type Folder = {
  "@context": "https://schema.org";
  "@type": "Collection";
  name: string;
  identifier: string;
  dateCreated: string;
};
