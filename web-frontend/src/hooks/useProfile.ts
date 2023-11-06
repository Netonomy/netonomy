import Web5Context from "@/Web5Provider";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useContext, useEffect } from "react";

// Atoms
const profileAtom = atomWithStorage<Person | null>("person", null);
const fetchedProfile = atom(false);

export const showedCreatedProfileAtom = atomWithStorage(
  "showedCreateProfile",
  false
);

export default function useProfile() {
  const [profile, setProfile] = useAtom(profileAtom);
  const [fetched, setFetched] = useAtom(fetchedProfile);
  const web5Context = useContext(Web5Context);

  const [, setShowedCreated] = useAtom(showedCreatedProfileAtom);

  async function fetchProfile() {
    if (web5Context.web5) {
      const { records } = await web5Context.web5.dwn.records.query({
        message: {
          filter: {
            schema: "https://schema.org/Person",
          },
        },
      });

      if (records && records?.length > 0) {
        const profile = await records[0].data.json();

        // Load the profile image
        if (profile.image) {
          const image = await web5Context.web5.dwn.records.read({
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
        if (profile.banner) {
          const banner = await web5Context.web5.dwn.records.read({
            message: {
              recordId: profile.banner,
            },
          });

          const blob = await banner?.record.data.blob();

          profile.banner = URL.createObjectURL(blob);
        }

        setProfile(profile);
      }
    }

    setFetched(true);
  }

  async function createProfile(profile: Person) {
    if (web5Context.web5) {
      const record = await web5Context.web5.dwn.records.create({
        data: profile,
        message: {
          schema: "https://schema.org/Person",
        },
      });

      if (record) {
        // Load the profile image
        if (profile.image) {
          const image = await web5Context.web5.dwn.records.read({
            message: {
              recordId: profile.image,
            },
          });

          const blob = await image?.record.data.blob();

          profile.image = URL.createObjectURL(blob);
        }

        // Load the banner image
        if (profile.banner) {
          const banner = await web5Context.web5.dwn.records.read({
            message: {
              recordId: profile.banner,
            },
          });

          const blob = await banner?.record.data.blob();

          profile.banner = URL.createObjectURL(blob);
        }

        setProfile(profile);
      }
    }
  }

  useEffect(() => {
    fetchProfile();
  }, [web5Context]);

  return { profile, createProfile, fetched };
}

// Types

type Person = {
  name: string;
  "@context": string;
  "@type": string;
  email?: string;
  image?: string;
  url?: string;
  banner?: string;
};
