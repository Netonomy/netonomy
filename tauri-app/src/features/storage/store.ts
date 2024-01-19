import { MyFile } from "@/types/MyFile";
import { PageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { ZoomPlugin } from "@react-pdf-viewer/zoom";
import { Record } from "@web5/api";
import { create } from "zustand";

interface StorageState {
  // The display type
  selectedDisplay: "grid" | "list";
  setSelectedDisplay: (display: "grid" | "list") => void;

  // The file in view
  fileInView: {
    record: Record;
    data: MyFile;
    blob: Blob;
  } | null;
  setFileInView: (
    file: {
      record: Record;
      data: MyFile;
      blob: Blob;
    } | null
  ) => void;

  // PDF plugins
  pdfZoomPlugin: ZoomPlugin | null;
  pdfNavigationPlugin: PageNavigationPlugin | null;
  setPdfPlugins: (
    zoomPlugin: ZoomPlugin | null,
    navigationPlugin: PageNavigationPlugin | null
  ) => void;
}

const useStorageStore = create<StorageState>((set) => ({
  selectedDisplay: "grid",
  setSelectedDisplay: (display) => set({ selectedDisplay: display }),
  fileInView: null,
  setFileInView: (file) => set({ fileInView: file }),
  pdfZoomPlugin: null,
  pdfNavigationPlugin: null,
  setPdfPlugins: (zoomPlugin, navigationPlugin) =>
    set({ pdfZoomPlugin: zoomPlugin, pdfNavigationPlugin: navigationPlugin }),
}));

export default useStorageStore;
