// This file contains functions for fetching and creating items in the profile protocol

import useWeb5Store from "@/features/app/useWeb5Store";
import { Record, RecordsQueryRequest } from "@web5/api";
import { profileProtocol } from "./profile.protocol";
import { Profile } from "@/types/Profile";

/**
 * Fetches a profile
 * @param {string} did The DID of the profile to fetch
 * @returns {Promise<{record: Record, data: Profile, avatarImageBlob: Blob | null}>} An object containing the record, data, and blob of the profile
 * @throws {Error} If the profile could not be fetched
 * @throws {Error} If no profile was found
 */
export const fetchProfile = async (
  did?: string
): Promise<{
  record: Record;
  data: Profile;
  avatarImageBlob: Blob | null;
}> => {
  const { web5, did: usersDid } = useWeb5Store.getState();
  if (!web5 || !usersDid) throw new Error("Could not fetch profile");

  try {
    // Create the query options
    const profileQuery: RecordsQueryRequest = {
      message: {
        filter: {
          schema: profileProtocol.types.profile.schema,
          // protocol: schemaOrgProtocolDefinition.protocol,
          // dataFormat: "application/json",
        },
      },
    };

    // If the profile belongs to the user, add the user's DID to the query
    if (usersDid !== did) profileQuery.from = did;

    // Fetch the profile
    const { records } = await web5.dwn.records.query(profileQuery);

    // If there are no records, return
    if (!records || records.length === 0) throw new Error("No profile found");

    // If there are records, load them
    const profile: Profile = await records[0].data.json();

    // Get the id of the profile image blob
    const profileImageBlobId = profile.avatarBlobId;

    // Fetch the profile image blob
    let avatarImageBlob: Blob | null = null;
    if (profileImageBlobId) {
      let avatarImageQuery: RecordsQueryRequest = {
        message: {
          filter: {
            recordId: profileImageBlobId,
          },
        },
      };

      if (usersDid !== did) {
        avatarImageQuery.from = did;
      }

      const { record: avatarImageBlobRecord } = await web5.dwn.records.read(
        avatarImageQuery
      );
      avatarImageBlob = await avatarImageBlobRecord.data.blob();
    }

    return {
      record: records[0],
      data: profile,
      avatarImageBlob,
    };
  } catch (err) {
    console.error(err);
    throw new Error("Could not fetch profile");
  }
};

/**
 * Updates a profile
 * @param {Record} record The record of the profile to update
 * @param {Profile} data The new data of the profile
 * @param {File} newAvatarImageBlob The new avatar image blob
 * @throws {Error} If the profile could not be updated
 */
export const updateProfile = async (
  record: Record,
  data: Profile,
  newAvatarImageBlob?: File
): Promise<void> => {
  const { web5, did } = useWeb5Store.getState();
  if (!web5 || !did) throw new Error("Could not update profile");

  try {
    // If new avatar image blob, create it
    let avatarBlobId: string | null = data.avatarBlobId || null;
    if (newAvatarImageBlob) {
      // Get the id of the old avatar image blob
      const oldAvatarBlobId = (await record.data.json()).avatarBlobId;
      avatarBlobId = oldAvatarBlobId;

      // If there is no blob id then create one
      if (!oldAvatarBlobId) {
        // Convert to blob
        const blob = new Blob([newAvatarImageBlob], {
          type: "image/png",
        });

        // Upload the blob
        const { record: newAvatarBlobRecord } = await web5.dwn.records.create({
          data: blob,
          message: {
            published: true,
          },
        });
        newAvatarBlobRecord?.send(did);

        avatarBlobId = newAvatarBlobRecord?.id || null;
      } else {
        // Fetch the old avatar image blob record
        const { record: oldAvatarBlobRecord } = await web5.dwn.records.read({
          message: {
            filter: {
              recordId: oldAvatarBlobId,
            },
          },
        });

        const blob = new Blob([newAvatarImageBlob], {
          type: "image/png",
        });

        oldAvatarBlobRecord.update({
          data: blob,
          published: true,
        });
        oldAvatarBlobRecord.send(did);
      }
    }

    // Update the profile
    data.avatarBlobId = avatarBlobId || undefined;
    await record.update({
      data,
    });
    record.send(did);
  } catch (err) {
    console.error(err);
    throw new Error("Could not update profile");
  }
};

/**
 * Creates a profile
 * @param {Profile} data The data of the profile to create
 * @param {File} avatarImageBlob The avatar image blob
 * @throws {Error} If the profile could not be created
 * @returns {Promise<void>}
 */
export const createProfile = async (
  data: Profile,
  avatarImageBlob: File | null
): Promise<void> => {
  const { web5, did } = useWeb5Store.getState();
  if (!web5 || !did) throw new Error("Could not create profile");

  try {
    // If there is an avatar image blob, create it
    let avatarBlobId: string | null = null;
    if (avatarImageBlob) {
      const blob = new Blob([avatarImageBlob], {
        type: "image/png",
      });

      const { record } = await web5.dwn.records.create({
        data: blob,
        message: {
          published: true,
        },
      });
      record?.send(did);

      avatarBlobId = record?.id || null;
    }

    // Update the profile data
    data.avatarBlobId = avatarBlobId || undefined;

    // Create the profile
    const { record: profileRecord } = await web5.dwn.records.create({
      data,
      message: {
        schema: profileProtocol.types.profile.schema,
        published: true,
      },
    });

    profileRecord?.send(did);
  } catch (err) {
    throw new Error("Could not create profile");
  }
};
