import { create } from "zustand";
import useWeb5Store, { schemaOrgProtocolDefinition } from "./useWeb5Store";
import { Record } from "@web5/api";
import useAppStore from "./useAppStore";
import { atomWithStorage } from "jotai/utils";
import { makeThumb, makeThumbFromVideo } from "@/lib/utils";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export const selectedStorageDisplayTabAtom = atomWithStorage(
  "selectedStorageDisplayTab",
  "grid"
);

interface StorageState {
  collection: Record | null;
  selectedDisplayTab: "grid" | "list"; // Used to determine which tab is selected in the display tab bar
  collectionItems:
    | {
        data: DigitalDocument | Collection;
        record: Record;
      }[]
    | null;
  filteredCollectionItems:
    | {
        data: DigitalDocument | Collection;
        record: Record;
      }[]
    | null;
  searchStr: string;
  fetching: boolean;
  file: {
    data: DigitalDocument;
    blob: Blob;
    record: Record;
  } | null;
  fetchingFile: boolean;
  actions: {
    setSelectedDisplayTab: (tab: "grid" | "list") => void;
    fetchFilesAndFolders: (parentId?: string) => Promise<void>;
    uploadFile: (file: File) => Promise<void>;
    fetchFile: (recordId: string) => Promise<void>;
    fetchBlob: (recordId: string) => Promise<Blob | null>;
    deleteItem: (recordId: string) => Promise<void>;
    updateFileItem: (
      recordId: string,
      data: DigitalDocument,
      publish: boolean
    ) => Promise<void>;
    createCollection: ({
      name,
      parentId,
    }: {
      name: string;
      parentId?: string;
    }) => Promise<void>;
    handleSearch: (searchStr: string) => void;
  };
}

const useStorageStore = create<StorageState>((set, get) => ({
  collection: null,
  collectionItems: null,
  filteredCollectionItems: null,
  searchStr: "",
  fetching: false,
  file: null,
  fetchingFile: false,
  selectedDisplayTab: "grid",
  actions: {
    setSelectedDisplayTab: (tab: "grid" | "list") => {
      set({ selectedDisplayTab: tab });
    },
    fetchFilesAndFolders: async (parentId?: string) => {
      const web5 = useWeb5Store.getState().web5;
      if (!web5) return;

      // set({ fetching: true });

      // // Set the collection items to null
      // set({ collectionItems: null });

      // If parentId is provided, fetch the collection
      if (parentId) {
        const { record } = await web5.dwn.records.read({
          message: {
            filter: {
              recordId: parentId,
            },
          },
        });

        set({ collection: record });
      } else {
        set({ collection: null });
      }

      // Set the collection items
      let items: {
        data: DigitalDocument | Collection;
        record: Record;
      }[] = [];

      // Fetch the collections
      const { records: collectionRecords } = await web5.dwn.records.query({
        message: {
          filter: {
            schema: "https://schema.org/Collection",
            protocol: schemaOrgProtocolDefinition.protocol,
            parentId: parentId || undefined,
          },
        },
      });

      if (collectionRecords && collectionRecords.length > 0) {
        // Loop through the collections
        for (var i = 0; i < collectionRecords.length; i++) {
          const record = collectionRecords[i];
          let data: Collection = await record.data.json();

          data.identifier = record.id;

          // Add the collection to the files and folders array
          items.push({
            data,
            record,
          });
        }
      }

      // Fetch the collection items
      const { records: collectionItems } = await web5.dwn.records.query({
        message: {
          filter: {
            parentId: parentId || undefined,
            protocol: schemaOrgProtocolDefinition.protocol,
            schema: "https://schema.org/DigitalDocument",
            protocolPath: parentId
              ? "collection/digitalDocument"
              : "digitalDocument",
          },
        },
      });

      if (collectionItems && collectionItems.length > 0) {
        // Loop through the collection items
        for (var i = 0; i < collectionItems.length; i++) {
          const record = collectionItems[i];
          let data: DigitalDocument = await record.data.json();

          data.identifier = record.id;
          data.published = record.published;

          // Add the folder to the files and folders array
          items.push({
            data,
            record,
          });
        }
      }

      // Sort the collection items by date created
      items.sort((a, b) => {
        if (a.data.dateCreated && b.data.dateCreated) {
          return (
            new Date(b.data.dateCreated).getTime() -
            new Date(a.data.dateCreated).getTime()
          );
        } else {
          return 0;
        }
      });

      set({ fetching: false });
      set({ collectionItems: items, fetching: false });
    },
    updateFileItem: async (
      recordId: string,
      data: DigitalDocument,
      publish: boolean
    ) => {
      const web5 = useWeb5Store.getState().web5;
      if (!web5) return;
      try {
        // set loading
        useAppStore.getState().actions.setLoading(true);

        // Fetch the record
        const { record } = await web5.dwn.records.read({
          message: {
            filter: {
              recordId,
            },
          },
        });

        // Update the record
        await record?.update({
          data: {
            ...data,
            published: publish,
          },
          published: publish,
        });

        if (data.thumbnailBlobId) {
          // Fetch the thumbnail record
          const { record: thumbnailRecord } = await web5.dwn.records.read({
            message: {
              filter: {
                recordId: data.thumbnailBlobId,
              },
            },
          });

          // Update the thumbnail record
          thumbnailRecord.update({
            published: publish,
          });
        }

        if (data.fileBlobId) {
          // Fetch the file record
          const { record: fileRecord } = await web5.dwn.records.read({
            message: {
              filter: {
                recordId: data.fileBlobId,
              },
            },
          });

          // Update the file record
          fileRecord.update({
            published: publish,
          });
        }

        // Update the collection items array
        set((state) => ({
          ...state,
          collectionItems: state.collectionItems?.map((item) => {
            if (item.data.identifier === recordId) {
              return {
                data: item.data,
                record: {
                  ...item.record,
                  published: publish,
                } as Record,
              };
            } else {
              return item;
            }
          }),
        }));
      } catch (err) {
        console.error(err);
      }

      // unset loading
      useAppStore.getState().actions.setLoading(false);
    },
    uploadFile: async (file: File) => {
      try {
        const web5 = useWeb5Store.getState().web5;
        const did = useWeb5Store.getState().did;
        if (!web5 || !did) return;

        useAppStore.getState().actions.setLoading(true);

        // Convert file to blob
        const blob = new Blob([file], {
          type: file.type,
        });

        // Upload the file
        const { record: uploadedFile } = await web5.dwn.records.create({
          data: blob,
        });

        // Send to dwn
        uploadedFile?.send(did);

        // If the file is a pdf, create a thumbnail
        let thumbnailBlobId: string | undefined = undefined;
        if (file.type === "application/pdf") {
          try {
            const loadingTask = pdfjs.getDocument(URL.createObjectURL(blob));
            const doc = await loadingTask.promise;
            const canvas = await doc.getPage(1).then(makeThumb);

            // Convert canvas to blob
            const thumbnailBlob = await new Promise((resolve) => {
              canvas.toBlob((blob: Blob) => {
                resolve(blob);
              });
            });

            // Upload the thumbnail blob
            const { record: uploadedThumbnail } = await web5.dwn.records.create(
              {
                data: thumbnailBlob,
              }
            );
            thumbnailBlobId = uploadedThumbnail?.id;
            uploadedThumbnail?.send(did);
          } catch (error) {
            console.error(error);
          }
        } else if (file.type.startsWith("video/")) {
          const canvas: any = await makeThumbFromVideo(blob);

          // Convert canvas to blob
          const thumbnailBlob = await new Promise((resolve) => {
            canvas.toBlob((blob: Blob) => {
              resolve(blob);
            });
          });

          // Upload the thumbnail blob
          const { record: uploadedThumbnail } = await web5.dwn.records.create({
            data: thumbnailBlob,
            message: {
              published: false,
            },
          });
          thumbnailBlobId = uploadedThumbnail?.id;
          uploadedThumbnail?.send(did);
        }

        // Create the digital document
        let data: DigitalDocument = {
          "@context": "https://schema.org",
          "@type": "DigitalDocument",
          name: file.name,
          encodingFormat: file.type,
          size: file.size.toString(),
          fileBlobId: uploadedFile!.id,
          identifier: "",
          thumbnailBlobId,
          dateCreated: new Date().toISOString(),
          dateModified: new Date().toISOString(),
          datePublished: new Date().toISOString(),
        };

        // Upload the digital document
        const { record } = await web5.dwn.records.create({
          data,
          message: {
            schema: "https://schema.org/DigitalDocument",
            protocol: schemaOrgProtocolDefinition.protocol,
            protocolPath: get().collection?.id
              ? "collection/digitalDocument"
              : "digitalDocument",
            dataFormat: "application/json",
            published: false,
            parentId: get().collection?.id || undefined,
            contextId: get().collection?.contextId || undefined,
          },
        });

        record?.send(did);

        // Update the collection items array
        if (record) {
          data.identifier = record.id;

          set((state) => ({
            collectionItems: [
              {
                data,
                record,
              },
              ...(state.collectionItems ?? []),
            ],
          }));
        }
      } catch (err) {
        console.log(err);
        useAppStore.getState().actions.setLoading(false);
      }

      useAppStore.getState().actions.setLoading(false);
    },
    fetchBlob: async (recordId: string) => {
      const web5 = useWeb5Store.getState().web5;
      if (!web5) return null;

      const { record } = await web5.dwn.records.read({
        message: {
          filter: {
            recordId,
          },
        },
      });

      return record?.data.blob();
    },
    createCollection: async ({ name }: { name: string }) => {
      const web5 = useWeb5Store.getState().web5;
      if (!web5) return;

      let data: Collection = {
        "@context": "https://schema.org",
        "@type": "Collection",
        name,
        identifier: "",
        dateCreated: new Date().toISOString(),
      };

      const { record } = await web5.dwn.records.create({
        data,
        message: {
          schema: "https://schema.org/Collection",
          protocol: schemaOrgProtocolDefinition.protocol,
          protocolPath: get().collection
            ? "collection/collection"
            : "collection",
          dataFormat: "application/json",
          published: true,
          parentId: get().collection?.id || undefined,
          contextId: get().collection?.contextId || undefined,
        },
      });

      console.log(`Created collection: ${record?.id}`);

      // Add the collection to the files and folders array
      if (record) {
        data.identifier = record.id;
        set((state) => ({
          collectionItems: [
            {
              data,
              record,
            },
            ...(state.collectionItems ?? []),
          ],
        }));
      }
    },
    fetchFile: async (recordId: string) => {
      const web5 = useWeb5Store.getState().web5;
      if (!web5) return;

      set({ file: null, fetchingFile: true });

      web5.dwn.records
        .read({
          message: {
            filter: {
              recordId,
            },
          },
        })
        .then(async ({ record }) => {
          if (!record) return;

          let data: DigitalDocument = await record.data.json();

          // Fetch the file
          const { record: blobRecord } = await web5.dwn.records.read({
            message: {
              filter: {
                recordId: data.fileBlobId,
              },
            },
          });
          const blob = await blobRecord?.data.blob();

          set({
            file: {
              record,
              data,
              blob,
            },
            fetchingFile: false,
          });
        })
        .catch((err) => {
          console.error(err);
        });
    },
    deleteItem: async (recordId: string) => {
      const web5 = useWeb5Store.getState().web5;
      if (!web5) return;

      useAppStore.getState().actions.setLoading(true);

      // Delete the record
      await web5.dwn.records.delete({
        message: {
          recordId,
        },
      });

      // Remove the record from the collection items array
      set((state) => ({
        collectionItems: state.collectionItems?.filter(
          (item) => item.data.identifier !== recordId
        ),
      }));

      useAppStore.getState().actions.setLoading(false);
    },
    handleSearch: (searchStr: string) => {
      set({ searchStr });

      if (searchStr === "") {
        set({ filteredCollectionItems: null });
      } else {
        const filteredCollectionItems = get().collectionItems?.filter(
          (item) => {
            if (item.data["@type"] === "DigitalDocument") {
              return item.data.name
                .toLowerCase()
                .includes(searchStr.toLowerCase());
            } else {
              return item.data.name
                .toLowerCase()
                .includes(searchStr.toLowerCase());
            }
          }
        );

        set({ filteredCollectionItems });
      }
    },
  },
}));

export default useStorageStore;

export type DigitalDocument = {
  "@context": "https://schema.org";
  "@type": "DigitalDocument";
  name: string;
  encodingFormat: string;
  size: string;
  fileBlobId: string;
  identifier: string;
  published?: boolean;
  dateCreated?: string;
  dateModified?: string;
  datePublished?: string;
  thumbnailBlobId?: string;
};

export type Collection = {
  "@context": "https://schema.org";
  "@type": "Collection";
  name: string;
  identifier: string;
  dateCreated: string;
};
