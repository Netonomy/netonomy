import { useMutation, useQuery } from "@tanstack/react-query";
import { createProfile, fetchProfile, updateProfile } from "./services";
import { Profile } from "@/types/Profile";
import { queryClient } from "@/App";
import { Record } from "@web5/api";

export const useProfileQuery = (did: string) => {
  return useQuery({
    queryKey: ["profile", did],
    queryFn: () => fetchProfile(did),
  });
};

export const invaldiateProfileQuery = async (did: string) => {
  await queryClient.invalidateQueries({
    queryKey: ["profile", did],
  });
};

export const useCreateProfileMutation = () => {
  return useMutation({
    mutationKey: ["createProfile"],
    mutationFn: (data: { data: Profile; avatarImage: File | null }) =>
      createProfile(data.data, data.avatarImage),
  });
};

export const useUpdateProfileMutation = () => {
  return useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: (data: {
      data: Profile;
      record: Record;
      newAvatarImage?: File;
    }) => updateProfile(data.record, data.data, data.newAvatarImage),
  });
};
