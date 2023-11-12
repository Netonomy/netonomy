import { create } from "zustand";
import { persist } from "zustand/middleware";
import useWeb5Store from "./useWeb5Store";
import { client } from "@passwordless-id/webauthn";
import api from "@/config/api";

interface AuthState {
  token: null | string;
  actions: {
    setToken: (token: string) => void;
    login: () => Promise<void>;
    logout: () => void;
  };
}

const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      token: null,
      actions: {
        setToken: (token: string) => {
          set({ token });
        },
        logout: () => {
          set({ token: null });
        },
        login: async () => {
          try {
            const did = useWeb5Store.getState().did;
            if (!did) return;

            // Request challenge from server
            const challengeRes = await api.post("/auth/requestChallenge", {
              did,
            });
            const challenge = challengeRes.data.challenge;
            const credentialIds = challengeRes.data.credentialIds;

            const authentication = await client.authenticate(
              credentialIds,
              challenge,
              {
                authenticatorType: "auto",
                userVerification: "required",
                timeout: 60000,
              }
            );

            // Send authentication to server
            const loginRes = await api.post("/auth/login", {
              authentication,
              did,
            });

            if (loginRes.data.status === "FAILED") {
              throw new Error(loginRes.data.message);
            }

            // Set token
            set({ token: loginRes.data.token });
          } catch (err) {
            console.error(err);
          }
        },
      },
    }),
    {
      name: "auth-state",
    }
  )
);

export default useAuthStore;
