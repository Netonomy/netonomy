import { create } from "zustand";
import useWeb5Store from "./useWeb5Store";
// import { persist } from "zustand/middleware";

interface ProfileState {
  profile: Person | null;
  fetched: boolean;
  fetchProfile: () => Promise<void>;
  actions: {
    setProfile: (profile: Person) => void;
    setFetched: (fetched: boolean) => void;
    createProfile: (profile: Person) => Promise<void>;
  };
}

/**
 * Zustand store for managing the user's profile
 * This store contains the user's profile, and functions to fetch and create it.
 */
const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  fetched: false,
  fetchProfile: async () => {
    const web5 = useWeb5Store.getState().web5;
    if (!web5) return;

    // Fetch the profile
    const { records } = await web5.dwn.records.query({
      message: {
        filter: {
          schema: "https://schema.org/Person",
        },
      },
    });

    // If the profile exists, load it
    if (records && records?.length > 0) {
      const profile = await records[0].data.json();

      // Load the profile image
      if (profile.image) {
        const image = await web5.dwn.records.read({
          message: {
            recordId: profile.image,
          },
        });

        const blob = await image?.record.data.blob();

        const url = URL.createObjectURL(blob);
        profile.image = url;
      } else {
      }

      // Load the banner image
      //   if (profile.banner) {
      //     const banner = await web5.dwn.records.read({
      //       message: {
      //         recordId: profile.banner,
      //       },
      //     });

      //     const blob = await banner?.record.data.blob();

      //     profile.banner = URL.createObjectURL(blob);
      //   }

      // Set the profile
      set({ profile });
    }
    set({ fetched: true });
  },
  actions: {
    setProfile: (profile: Person) => set({ profile }),
    setFetched: (fetched: boolean) => set({ fetched }),
    createProfile: async (profile: Person) => {
      const web5 = useWeb5Store.getState().web5;
      if (!web5) return;

      const record = await web5.dwn.records.create({
        data: profile,
        message: {
          schema: "https://schema.org/Person",
        },
      });

      if (record) {
        // Load the profile image
        if (profile.image) {
          const image = await web5.dwn.records.read({
            message: {
              recordId: profile.image,
            },
          });

          const blob = await image?.record.data.blob();

          profile.image = URL.createObjectURL(blob);
        }

        // Load the banner image
        if (profile.banner) {
          const banner = await web5.dwn.records.read({
            message: {
              recordId: profile.banner,
            },
          });

          const blob = await banner?.record.data.blob();

          profile.banner = URL.createObjectURL(blob);
        }

        set({ profile });
      }
    },
  },
}));

export default useProfileStore;

type Person = {
  name: string;
  "@context": string;
  "@type": string;
  email?: string;
  image?: string;
  url?: string;
  banner?: string;
};
