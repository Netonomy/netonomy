import { storageProtocol } from "./storage.protocol";
import { MyFile } from "../../types/MyFile";
import * as pdfjs from "pdfjs-dist";
import { getFileType, makeThumb, makeThumbFromVideo } from "@/lib/utils";
import useWeb5Store from "@/features/app/useWeb5Store";
import { Record, RecordsReadRequest } from "@web5/api";

// This file contains functions for fetching and creating items in the storage protocol
// The storage protocol is a protocol for storing files on the Web5 network

/**
 * Fetches all items in the storage protocol
 * @returns {Promise<{record: Record, data: MyFile, thumbnailBlob: Blob | null}[]>} An array of objects containing the record, data, and blob of each item
 * @throws {Error} If the items could not be fetched
 */
export const fetchItemsInStorage = async (): Promise<
  {
    record: Record;
    data: MyFile;
    thumbnailBlob: Blob | null;
  }[]
> => {
  const { web5 } = useWeb5Store.getState();

  // If there is no Web5 instance, return
  if (!web5) return [];

  try {
    // Fetch the records
    const { records } = await web5.dwn.records.query({
      message: {
        filter: {
          schema: storageProtocol.types.document.schema,
        },
        dateSort: "createdDescending" as any,
      },
    });

    // If there are no records, return
    if (!records || records?.length === 0) return [];

    // If there are records, load them
    let files: {
      record: Record;
      data: MyFile;
      thumbnailBlob: Blob | null;
    }[] = [];

    for (const record of records) {
      // Load the record
      let item: MyFile = await record.data.json();

      // Get the id of the file blob
      const fileBlobId = item.fileBlobId;

      const fileType = getFileType(item.type);

      // Load the file blob if its a image else load the thumbnail blob
      // Check if there is a thumbnail
      let thumbnailBlob: Blob | null = null;
      if (fileType === "image") {
        // Fetch the file blob
        const { record: fileBlobRecord } = await web5.dwn.records.read({
          message: {
            filter: {
              recordId: fileBlobId,
            },
          },
        });

        // Get the file blob
        const blob = await fileBlobRecord!.data.blob();
        thumbnailBlob = blob;
      } else {
        if (item.thumbnailBlobId) {
          // Fetch the thumbnail blob
          const { record: thumbnailBlobRecord } = await web5.dwn.records.read({
            message: {
              filter: {
                recordId: item.thumbnailBlobId,
              },
            },
          });

          // Get the thumbnail blob
          thumbnailBlob = await thumbnailBlobRecord!.data.blob();
        }
      }

      files.push({
        record,
        data: item,
        thumbnailBlob,
      });
    }

    return files;
  } catch (err) {
    throw new Error("Failed to fetch files");
  }
};

/**
 * Fetches a file from the storage protocol
 * @param {string} did The DID of the file owner
 * @param {string} recordId The id of the record to fetch
 * @throws {Error} If the file could not be fetched
 * @returns {Promise<{record: Record, data: MyFile, fileBlob: Blob}>} An object containing the record and data of the file
 */
export const fetchfile = async (
  did: string,
  recordId: string
): Promise<{
  record: Record;
  data: MyFile;
  fileBlob: Blob;
}> => {
  const { web5, did: usersDid } = useWeb5Store.getState();
  // If there is no Web5 instance, return
  if (!web5 || !usersDid) throw new Error("No Web5 instance");

  try {
    let query: RecordsReadRequest = {
      message: {
        filter: {
          recordId,
        },
      },
    };
    if (usersDid !== did) {
      query.from = did;
    }

    // Fetch the record
    const { record } = await web5.dwn.records.read(query);

    // If there are no records, return
    if (!record) throw new Error("No record");

    let item: MyFile = await record.data.json();

    // Get the id of the file blob
    const fileBlobId = item.fileBlobId;

    // Create the query options for the file blob
    let fileBlobQuery: RecordsReadRequest = {
      message: {
        filter: {
          recordId: fileBlobId,
        },
      },
    };
    if (usersDid !== did) {
      fileBlobQuery.from = did;
    }

    // Fetch the file blob
    const { record: fileBlobRecord } = await web5.dwn.records.read(
      fileBlobQuery
    );
    const fileBlob = await fileBlobRecord!.data.blob();

    return {
      record,
      data: item,
      fileBlob,
    };
  } catch (err) {
    throw new Error("Failed to fetch files");
  }
};

/**
 * Uploads a file to the storage protocol
 * @param {File} file The file to upload
 * @throws {Error} If the file could not be uploaded
 * @returns {Promise<void>}
 */
export const uploadFileToStorage = async (file: File) => {
  const { web5, did } = useWeb5Store.getState();
  // If there is no Web5 instance, return
  if (!web5 || !did) throw new Error("No Web5 instance");

  try {
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
        const { record: uploadedThumbnail } = await web5.dwn.records.create({
          data: thumbnailBlob,
        });
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

    // Create the file
    let fileData: MyFile = {
      name: file.name,
      type: file.type,
      size: file.size,
      thumbnailBlobId,
      fileBlobId: uploadedFile!.id,
      dateCreated: new Date().toISOString(),
    };

    // Create the record
    const { record: fileRecord } = await web5.dwn.records.create({
      data: fileData,
      message: {
        schema: storageProtocol.types.document.schema,
        published: false,
      },
    });

    // Send the record
    fileRecord?.send(did);
  } catch (err) {
    throw new Error("Failed to upload file");
  }
};

/**
 * Deletes a file from the storage protocol
 * @param {string} recordId The id of the record to delete
 * @throws {Error} If the file could not be deleted
 * @returns {Promise<void>}
 */
export const deleteFileFromStorage = async (
  recordId: string
): Promise<void> => {
  const { web5, did } = useWeb5Store.getState();
  // If there is no Web5 instance, return
  if (!web5 || !did) throw new Error("No Web5 instance");

  try {
    // Delete the file
    await web5.dwn.records.delete({
      message: {
        recordId,
      },
    });
  } catch (err) {
    throw new Error("Failed to delete file");
  }
};

/**
 * Updates a file in the storage protocol
 * @param {Record} record The record to update
 * @param {MyFile} fileData The new file data
 * @param {boolean} publish Whether to publish the file
 * @throws {Error} If the file could not be updated
 * @returns {Promise<void>}
 */
export const updateFileInfo = async (
  record: Record,
  fileData: MyFile,
  publish: boolean
): Promise<void> => {
  const { web5, did } = useWeb5Store.getState();
  // If there is no Web5 instance, return
  if (!web5 || !did) throw new Error("No Web5 instance");

  try {
    // Update the file info
    await record.update({
      data: fileData,
      published: publish,
    });

    record.send(did);

    // If there is a thumbnail, update it
    if (fileData.thumbnailBlobId) {
      // Fetch the thumbnail record
      const { record: thumbnailRecord } = await web5.dwn.records.read({
        message: {
          filter: {
            recordId: fileData.thumbnailBlobId,
          },
        },
      });

      // Update the thumbnail record
      await thumbnailRecord?.update({
        published: publish,
      });
      await thumbnailRecord?.send(did);
    }

    // Fetch the file blob
    const { record: fileBlobRecord } = await web5.dwn.records.read({
      message: {
        filter: {
          recordId: fileData.fileBlobId,
        },
      },
    });

    // Update the file blob
    await fileBlobRecord?.update({
      published: publish,
    });
    await fileBlobRecord?.send(did);
  } catch (err) {
    throw new Error("Failed to update file");
  }
};
