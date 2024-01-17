import { create } from "zustand";
import useWeb5Store from "./useWeb5Store";
import { Record, RecordsQueryRequest, RecordsReadRequest } from "@web5/api";
import { Profile } from "@/types/Profile";

const profileSchema = "https://netonomy.io/Profile";

interface ProfileState {
  profile: Profile | null;
  avatarImage: Blob | null;
  profileRecord: Record | null;
  fetched: boolean;
  fetchProfile: (did?: string) => Promise<void>;
  actions: {
    setProfile: (profile: Profile) => void;
    setFetched: (fetched: boolean) => void;
    updateProfile: (profile: Profile) => Promise<void>;
    createProfile: ({
      name,
      profileImg,
      about,
    }: {
      name: string;
      profileImg: File;
      about?: string;
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
  avatarImage: null,
  profileRecord: null,
  fetched: false,
  fetchProfile: async (did?: string) => {
    const web5 = useWeb5Store.getState().web5;
    const usersDid = useWeb5Store.getState().did;
    if (!web5 || !usersDid) return;

    // Check if the profile is the owner's profile
    let isOwnerProfile = true;
    if (did) {
      isOwnerProfile = usersDid === did;
    }

    try {
      // Create the query options
      const queryOptions: RecordsQueryRequest = {
        message: {
          filter: {
            schema: profileSchema,
            // protocol: schemaOrgProtocolDefinition.protocol,
            dataFormat: "application/json",
          },
        },
      };

      // If the profile is not the owner's profile, add the from field to the query options
      if (!isOwnerProfile) queryOptions["from"] = did;

      // Fetch the profile
      const { records } = await web5.dwn.records.query(queryOptions);

      // If the profile exists, load it
      if (records && records?.length > 0) {
        set({ profileRecord: records[0] });
        const profile: Profile = await records[0].data.json();

        // Load the profile image
        if (profile.avatarBlobId) {
          // Create the query options for the profile image
          const profileImgQueryOptions: RecordsReadRequest = {
            message: {
              filter: {
                recordId: profile.avatarBlobId,
              },
            },
          };

          // If the profile is not the owner's profile, add the from field to the query options
          if (!isOwnerProfile) profileImgQueryOptions["from"] = did;

          // Fetch the profile image and set it
          const image = await web5.dwn.records.read(profileImgQueryOptions);
          const blob = await image?.record.data.blob();
          set({ avatarImage: blob });
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
    setProfile: (profile: Profile) => set({ profile }),
    setFetched: (fetched: boolean) => set({ fetched }),
    updateProfile: async (profile: Profile) => {
      try {
        const web5 = useWeb5Store.getState().web5;
        const did = useWeb5Store.getState().did;
        if (!web5 || !did) return;

        // Get the profile record
        const { profileRecord } = useProfileStore.getState();

        // Update the profile record
        const updateRes = await profileRecord?.update({
          data: profile,
          published: true,
        });

        // Update the profile record and person state
        if (updateRes?.status.code === 200) set({ profileRecord, profile });
      } catch (error) {
        console.error(error);
      }
    },
    createProfile: async ({
      name,
      profileImg,
      about,
    }: {
      name: string;
      profileImg: File;
      about?: string;
    }) => {
      try {
        const web5 = useWeb5Store.getState().web5;
        const did = useWeb5Store.getState().did;
        if (!web5 || !did) return;

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

        // Send the profile record
        // await profileImgRecord?.send(did!)
        const profile: Profile = {
          name,
          avatarBlobId: profileImgRecord?.id,
          about,
        };

        const { record: profileRecord } = await web5.dwn.records.create({
          data: profile,
          message: {
            schema: profileSchema,
            // protocol: schemaOrgProtocolDefinition.protocol,
            // protocolPath: "person",
            dataFormat: "application/json",
            published: true,
          },
        });

        if (profileRecord) {
          const profile: Profile = {
            name,
            avatarBlobId: profileImgRecord?.id,
            // image: URL.createObjectURL(blob),
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

        // Update the profile record
        const updateRes = await profileRecord?.update({
          data,
          published: true,
        });

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
