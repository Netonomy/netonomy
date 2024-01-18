import { create } from "zustand";
import useWeb5Store from "./useWeb5Store";
import { Record, RecordsQueryRequest, RecordsReadRequest } from "@web5/api";
import { Profile } from "@/types/Profile";

const profileSchema = "https://netonomy.io/Profile";

interface ProfileState {
  profile: Profile | null;
  avatarImage: Blob | null;
  avatarImageRecord: Record | null;
  profileRecord: Record | null;
  fetched: boolean;
  fetchProfile: (did?: string) => Promise<void>;
  actions: {
    setProfile: (profile: Profile) => void;
    setFetched: (fetched: boolean) => void;
    updateProfile: ({
      name,
      about,
      newAvatarImage,
    }: {
      name?: string;
      about?: string;
      newAvatarImage?: File;
    }) => Promise<void>;
    createProfile: ({
      name,
      profileImg,
      about,
    }: {
      name: string;
      profileImg?: File;
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
const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  avatarImage: null,
  avatarImageRecord: null,
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
      if (!isOwnerProfile) queryOptions.from = did;

      // Fetch the profile
      const { records } = await web5.dwn.records.query(queryOptions);

      console.log(records);

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
          if (!isOwnerProfile) profileImgQueryOptions.from = did;

          // Fetch the profile image and set it
          const image = await web5.dwn.records.read(profileImgQueryOptions);
          set({ avatarImageRecord: image?.record });
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
    updateProfile: async ({
      name,
      about,
      newAvatarImage,
    }: {
      name?: string;
      about?: string;
      newAvatarImage?: File;
    }) => {
      try {
        const web5 = useWeb5Store.getState().web5;
        const did = useWeb5Store.getState().did;
        if (!web5 || !did) return;

        // Get the profile record
        const { profileRecord, profile } = useProfileStore.getState();

        // If the profile record doesn't exist, create it
        if (!profileRecord) {
          get().actions.createProfile({
            name: name ? name : "",
            about: about ? about : "",
            profileImg: newAvatarImage,
          });
        } else {
          // Create the new profile data based on the provided data
          const profileData: Profile = {
            name: name ? name : profile?.name || "",
            about: about ? about : profile?.about,
            avatarBlobId: profile?.avatarBlobId,
          };

          // Get the profile image record
          const { avatarImageRecord } = useProfileStore.getState();

          // If new avatar image is provided, update the profile image record
          if (newAvatarImage && avatarImageRecord) {
            const blob = new Blob([newAvatarImage], {
              type: "image/png",
            });

            // Update the profile image record
            await avatarImageRecord?.update({
              data: blob,
              published: true,
            });
            avatarImageRecord.send(did);

            // Update the profile image record and person state
            set({ avatarImageRecord, avatarImage: blob });
          } else if (newAvatarImage && !avatarImageRecord) {
            // If new avatar image is provided, but the profile image record doesn't exist, create it
            const blob = new Blob([newAvatarImage], {
              type: "image/png",
            });

            // Upload the profile image record
            const { record } = await web5.dwn.records.create({
              data: blob,
              message: {
                published: true,
              },
            });
            record?.send(did);

            profileData.avatarBlobId = record?.id;

            // Update the profile image record and person state
            set({ avatarImageRecord: record, avatarImage: blob });
          }

          // Update the profile record
          await profileRecord?.update({
            data: profileData,
            published: true,
          });

          profileRecord?.send(did);

          // Update the profile record and person state
          set({ profileRecord, profile: profileData });
        }
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
      profileImg?: File;
      about?: string;
    }) => {
      try {
        const web5 = useWeb5Store.getState().web5;
        const did = useWeb5Store.getState().did;
        if (!web5 || !did) return;

        // Convert file to blob
        let profileImgRecord: Record | undefined;
        if (profileImg) {
          const blob = new Blob([profileImg], {
            type: "image/png",
          });

          const { record } = await web5.dwn.records.create({
            data: blob,
            message: {
              published: true,
            },
          });
          profileImgRecord = record;

          // Update the profile image record and person state
          set({ avatarImageRecord: record, avatarImage: blob });
        }

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
            about,
            avatarBlobId: profileImgRecord?.id,
          };

          set({ profile, fetched: true, profileRecord });
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
