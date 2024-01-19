import { Web5 } from "@web5/api/browser";
import { create } from "zustand";

interface Web5State {
  web5: Web5 | null;
  did: string | null;
  connect: () => Promise<void>;
  configureProtocols: () => Promise<void>;
}

/**
 * Zustand store for managing Web5 state
 * This store contains the Web5 instance, the decentralized identifier (DID),
 * and functions to connect and configure protocols.
 */
const useWeb5Store = create<Web5State>((set, get) => ({
  web5: null,
  did: null,
  connect: async () => {
    try {
      // Connect to Web5
      const { web5, did } = await Web5.connect({
        techPreview: {
          dwnEndpoints: [import.meta.env.VITE_DWN_URL as string],
        },
        // sync: "1000",
      });

      // Set the Web5 instance and DID
      set({ web5, did });

      // Configure protocols
      get().configureProtocols();
    } catch (err) {
      console.error(err);
    }
  },
  configureProtocols: async () => {
    const web5 = get().web5;
    const did = get().did;
    if (!web5 || !did) return;

    for (const p of protocols) {
      const { protocols, status } = await web5.dwn.protocols.query({
        message: {
          filter: {
            protocol: p.protocol,
          },
        },
      });

      if (status.code !== 200) {
        alert("Failed to query protocols. check console");
        // console.error("Failed to query protocols", status);

        return;
      }

      // protocol already exists
      if (protocols.length > 0) {
        // console.log("protocol already exists");
      }

      // configure protocol on local DWN
      const { protocol } = await web5.dwn.protocols.configure({
        message: {
          definition: p,
        },
      });
      // console.log("configure protocol local status", configureStatus);

      // configure protocol on remote DWN, because sync may not have occured yet
      await protocol!.send(did);
      // console.log("configure protocol remote status", remoteConfigureStatus);
    }
  },
}));

export default useWeb5Store;

const protocols: any = [];
