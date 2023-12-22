import { NavBarOptions } from "@/enums/NavBarOptions";
import { create } from "zustand";

interface AppState {
  navBarItem: NavBarOptions;
  actions: {
    setNavBarItem: (navBarItem: NavBarOptions) => void;
  };
}

const useAppStore = create<AppState>((set, get) => ({
  navBarItem: NavBarOptions.messages,
  actions: {
    setNavBarItem: (navBarItem: NavBarOptions) => {
      set({ navBarItem });
    },
  },
}));

export default useAppStore;
