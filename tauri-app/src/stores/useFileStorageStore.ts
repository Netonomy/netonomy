import { create } from "zustand";
import useWeb5Store, { schemaOrgProtocolDefinition } from "./useWeb5Store";
import { Record } from "@web5/api";
import useAppStore from "./useAppStore";

interface StorageState {
  collection: Record | null;
  selectedDisplayTab: "grid" | "list"; // Used to determine which tab is selected in the display tab bar
  collectionItems: (DigitalDocument | Collection)[] | null;
  filteredCollectionItems: (DigitalDocument | Collection)[] | null;
  searchStr: string;
  fetching: boolean;
  file: {
    data: DigitalDocument;
    blob: Blob;
  } | null;
  fetchingFile: boolean;
  actions: {
    setSelectedDisplayTab: (tab: "grid" | "list") => void;
    fetchFilesAndFolders: (parentId?: string) => Promise<void>;
    uploadFile: (file: File) => Promise<void>;
    fetchFile: (recordId: string) => Promise<void>;
    deleteItem: (recordId: string) => Promise<void>;
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
      let items: (DigitalDocument | Collection)[] = [];

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
          let data = await record.data.json();

          data.identifier = record.id;

          // Add the collection to the files and folders array
          items.push(data);
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
          let data = await record.data.json();

          data.identifier = record.id;

          // Add the folder to the files and folders array
          items.push(data);
        }
      }

      // Sort the collection items by date created
      items.sort((a, b) => {
        if (a.dateCreated && b.dateCreated) {
          return (
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime()
          );
        } else {
          return 0;
        }
      });

      set({ collectionItems: items, fetching: false });
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

        // Create the digital document
        let data: DigitalDocument = {
          "@context": "https://schema.org",
          "@type": "DigitalDocument",
          name: file.name,
          encodingFormat: file.type,
          size: file.size.toString(),
          fileBlobId: uploadedFile!.id,
          identifier: "",
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
            published: true,
            parentId: get().collection?.id || undefined,
            contextId: get().collection?.contextId || undefined,
          },
        });

        // Update the collection items array
        if (record) {
          data.identifier = record.id;

          set((state) => ({
            collectionItems: [data, ...(state.collectionItems ?? [])],
          }));

          // Vectorize the file
          // upload to chroma
          const formData = new FormData();
          formData.append("file", file);
          formData.append("did", did);
          formData.append("recordId", record!.id);
        }
      } catch (err) {
        console.log(err);
      }

      useAppStore.getState().actions.setLoading(false);
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
          collectionItems: [data, ...(state.collectionItems ?? [])],
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
          (item) => item.identifier !== recordId
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
            if (item["@type"] === "DigitalDocument") {
              return item.name.toLowerCase().includes(searchStr.toLowerCase());
            } else {
              return item.name.toLowerCase().includes(searchStr.toLowerCase());
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
