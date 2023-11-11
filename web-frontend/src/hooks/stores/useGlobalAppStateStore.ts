import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GlobalAppState {
  token: null | string;
  actions: {
    setToken: (token: string) => void;
  };
}

const useGlobalAppStateStore = create(
  persist<GlobalAppState>(
    (set) => ({
      token: null,
      actions: {
        setToken: (token: string) => {
          set({ token });
        },
      },
    }),
    {
      name: "global-app-state",
    }
  )
);

export default useGlobalAppStateStore;
