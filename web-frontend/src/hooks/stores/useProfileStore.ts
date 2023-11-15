import { create } from "zustand";
import useWeb5Store, { schemaOrgProtocolDefinition } from "./useWeb5Store";

interface ProfileState {
  profile: Person | null;
  fetched: boolean;
  fetchProfile: () => Promise<void>;
  actions: {
    setProfile: (profile: Person) => void;
    setFetched: (fetched: boolean) => void;
    createProfile: ({
      name,
      profileImg,
    }: {
      name: string;
      profileImg: File;
    }) => Promise<void>;
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
    const did = useWeb5Store.getState().did;
    if (!web5 || !did) return;

    // Fetch the profile
    const { records } = await web5.dwn.records.query({
      message: {
        filter: {
          schema: "https://schema.org/Person",
          protocol: schemaOrgProtocolDefinition.protocol,
          dataFormat: "application/json",
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
            recordId: profile.image as string,
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
    createProfile: async ({
      name,
      profileImg,
    }: {
      name: string;
      profileImg: File;
    }) => {
      try {
        const web5 = useWeb5Store.getState().web5;
        if (!web5) return;

        // Convert file to blob
        const blob = new Blob([profileImg], {
          type: "image/png",
        });

        const { record: profileImgRecord } = await web5.dwn.records.create({
          data: blob,
          message: {
            published: true,
          },
        });

        const { record: profileRecord } = await web5.dwn.records.create({
          data: {
            "@context": "https://schema.org",
            "@type": "Person",
            name,
            image: profileImgRecord?.id,
          },
          message: {
            schema: "https://schema.org/Person",
            protocol: schemaOrgProtocolDefinition.protocol,
            protocolPath: "person",
            dataFormat: "application/json",
            published: true,
          },
        });

        await profileRecord?.send(useWeb5Store.getState().did!);

        if (profileRecord) {
          const profile: Person = {
            "@context": "https://schema.org",
            "@type": "Person",
            name,
            image: URL.createObjectURL(blob),
          };

          set({ profile, fetched: true });
        } else {
          throw new Error("Profile creation failed");
        }
      } catch (error) {
        console.log(error);
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
