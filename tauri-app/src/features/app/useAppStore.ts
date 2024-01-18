import { NavBarOption } from "@/enums/NavBarOption";
import { create } from "zustand";

interface AppState {
  navBarItem: NavBarOption;
  loading: boolean;
  actions: {
    setNavBarItem: (navBarItem: NavBarOption) => void;
    setLoading: (loading: boolean) => void;
  };
}

const useAppStore = create<AppState>((set) => ({
  navBarItem: NavBarOption.storage,
  loading: false,
  actions: {
    setNavBarItem: (navBarItem: NavBarOption) => {
      set({ navBarItem });
    },
    setLoading: (loading: boolean) => set({ loading }),
  },
}));

export default useAppStore;
