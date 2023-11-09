import { create } from "zustand";

interface LoadingState {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

/**
 * Zustand store for managing loading state
 * This store contains the loading state, and functions to set it.
 */
const useLoadingStore = create<LoadingState>((set) => ({
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
}));

export default useLoadingStore;
