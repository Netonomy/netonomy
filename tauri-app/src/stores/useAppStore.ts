import { NavBarOptions } from "@/enums/NavBarOptions";
import { create } from "zustand";

interface AppState {
  navBarItem: NavBarOptions;
  loading: boolean;
  actions: {
    setNavBarItem: (navBarItem: NavBarOptions) => void;
    setLoading: (loading: boolean) => void;
  };
}

const useAppStore = create<AppState>((set) => ({
  navBarItem: NavBarOptions.storage,
  loading: false,
  actions: {
    setNavBarItem: (navBarItem: NavBarOptions) => {
      set({ navBarItem });
    },
    setLoading: (loading: boolean) => set({ loading }),
  },
}));

export default useAppStore;
