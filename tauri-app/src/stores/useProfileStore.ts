import { create } from "zustand";
import useWeb5Store, { schemaOrgProtocolDefinition } from "./useWeb5Store";
import { Record, RecordsQueryRequest, RecordsReadRequest } from "@web5/api";
import { Person } from "@/types/Person";

interface ProfileState {
  profile: Person | null;
  profileRecord: Record | null;
  fetched: boolean;
  fetchProfile: (did?: string) => Promise<void>;
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
    createConnection: (did: string) => Promise<void>;
    isOwnerProfile: (did: string) => boolean;
  };
}

/**
 * Zustand store for managing the user's profile
 * This store contains the user's profile, and functions to fetch and create it.
 */
const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  profileRecord: null,
  fetched: false,
  fetchProfile: async (did?: string) => {
    const web5 = useWeb5Store.getState().web5;
    const usersDid = useWeb5Store.getState().did;
    if (!web5 || !usersDid) return;

    let isOwnerProfile = true;
    if (did) {
      isOwnerProfile = usersDid === did;
    }

    try {
      const queryOptions: RecordsQueryRequest = {
        message: {
          filter: {
            schema: "https://schema.org/Person",
            protocol: schemaOrgProtocolDefinition.protocol,
            dataFormat: "application/json",
          },
        },
      };

      if (!isOwnerProfile) queryOptions["from"] = did;

      // Fetch the profile
      const { records } = await web5.dwn.records.query(queryOptions);

      // If the profile exists, load it
      if (records && records?.length > 0) {
        set({ profileRecord: records[0] });
        const profile = await records[0].data.json();

        const profileImgQueryOptions: RecordsReadRequest = {
          message: {
            filter: {
              recordId: profile.image,
            },
          },
        };

        if (!isOwnerProfile) profileImgQueryOptions["from"] = did;

        // Load the profile image
        if (profile.image) {
          const image = await web5.dwn.records.read(profileImgQueryOptions);

          const blob = await image?.record.data.blob();

          const url = URL.createObjectURL(blob);
          profile.image = url;
        } else {
        }
        // Set the profile
        set({ profile });
      }
    } catch (err) {
      console.error(err);
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
        const did = useWeb5Store.getState().did;
        if (!web5 || !did) return;

        // Convert file to blob
        const blob = new Blob([profileImg], {
          type: "image/png",
        });

        const { record: profileImgRecord, status } =
          await web5.dwn.records.create({
            data: blob,
            message: {
              published: true,
            },
          });

        console.log(status);

        // Send the profile record
        // await profileImgRecord?.send(did!)

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

        console.log(profileRecord);

        // await profileRecord?.send(did)

        if (profileRecord) {
          const profile: Person = {
            name,
            image: URL.createObjectURL(blob),
          };

          set({ profile, fetched: true });
        } else {
          throw new Error("Profile creation failed");
        }
      } catch (error) {
        console.error(error);
      }
    },
    createConnection: async (did: string) => {
      const web5 = useWeb5Store.getState().web5;
      if (!web5) return;

      try {
        // Get the profile record
        const { profileRecord } = useProfileStore.getState();

        // Update the follows array of the profile record
        const data = await profileRecord?.data.json();
        if (data.follows) data.follows.push(did);
        else data.follows = [did];

        console.log(data);

        // Update the profile record
        const updateRes = await profileRecord?.update({
          data,
          published: true,
        });

        console.log(updateRes);

        // Update the profile record and person state
        if (updateRes?.status.code === 200)
          set({ profileRecord, profile: data });
      } catch (error) {
        console.error(error);
      }
    },
    isOwnerProfile: (did: string) => {
      if (!did || did === "") return true;
      const usersDid = useWeb5Store.getState().did;
      if (!usersDid) return false;

      return usersDid === did;
    },
  },
}));

export default useProfileStore;
