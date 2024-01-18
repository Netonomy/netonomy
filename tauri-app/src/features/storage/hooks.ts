import { useMutation, useQuery } from "@tanstack/react-query";
import { storageProtocol } from "./storage.protocol";
import {
  deleteFileFromStorage,
  fetchItemsInStorage,
  fetchfile,
  updateFileInfo,
  uploadFileToStorage,
} from "./services";
import { queryClient } from "@/App";
import { Record } from "@web5/api";
import { MyFile } from "@/types/MyFile";

// This file contains hooks for fetching and mutating items in the storage protocol

// This hook fetches all items in the storage protocol
export const useFilesQuery = () => {
  return useQuery({
    queryKey: ["files", storageProtocol.types.document.schema],
    queryFn: () => fetchItemsInStorage(),
  });
};

// This hook invalidates the files query
export const invalidateFilesQuery = async () => {
  await queryClient.invalidateQueries({
    queryKey: ["files", storageProtocol.types.document.schema],
  });
};

// This hook fetches a file
export const useFileQuery = (did: string, recordId: string) => {
  return useQuery({
    queryKey: ["file", did, recordId],
    queryFn: () => fetchfile(did, recordId),
  });
};

// This hook uploads a file
export const useUploadFileMutation = () => {
  return useMutation({
    mutationKey: ["uploadFile"],
    mutationFn: (file: File) => uploadFileToStorage(file),
  });
};

// This hook deletes a file
export const useDeleteFileMutation = () => {
  return useMutation({
    mutationKey: ["deleteFile"],
    mutationFn: (recordId: string) => deleteFileFromStorage(recordId),
  });
};

// This hook updates a file
export const useUpdateFileInfoMutation = () => {
  return useMutation({
    mutationKey: ["updateFileInfo"],
    mutationFn: (data: {
      record: Record;
      newFileInfo: MyFile;
      publish: boolean;
    }) => updateFileInfo(data.record, data.newFileInfo, data.publish),
  });
};

// This hook invalidates a file query
export const invalidateFileQuery = async (did: string, recordId: string) => {
  await queryClient.invalidateQueries({
    queryKey: ["file", did, recordId],
  });
};
