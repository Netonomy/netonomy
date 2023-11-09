import { create } from "zustand";

const useFileStore = create((set) => ({
  files: [],
}));
