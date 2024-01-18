import ProfileImgSelector from "@/features/profile/components/ProfileImgSelector";
import InlineEdit from "@/components/ui/InlineEdit";
import InlineEditTextarea from "@/components/ui/InlineEditTextArea";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useWeb5Store from "@/features/app/useWeb5Store";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  invaldiateProfileQuery,
  useCreateProfileMutation,
  useProfileQuery,
  useUpdateProfileMutation,
} from "@/features/profile/hooks";

export default function ProfilePage() {
  const { did: didInRoute } = useParams();
  const did = useWeb5Store((state) => state.did);

  const createProfileMutation = useCreateProfileMutation();
  const updateProfileMutation = useUpdateProfileMutation();

  const [name, setname] = useState("");
  const [about, setAbout] = useState("");

  const [aboutTimeout, setAboutTimeout] = useState<NodeJS.Timeout | null>(null);
  const [nameTimeout, setNameTimeout] = useState<NodeJS.Timeout | null>(null);

  const { data: profile, isFetching } = useProfileQuery(didInRoute!);

  const updateProfile = (data: {
    newAvatarImage?: File | null;
    name?: string;
    about?: string;
  }) => {
    // If there is no profile then create one
    if (!profile) {
      createProfileMutation.mutate(
        {
          avatarImage: data.newAvatarImage || null,
          data: {
            name: data.name || name,
            about: data.about || about,
          },
        },
        {
          onSuccess: () => invaldiateProfileQuery(did!),
        }
      );
    } else {
      updateProfileMutation.mutate(
        {
          record: profile.record,
          newAvatarImage: data.newAvatarImage || undefined,
          data: {
            name: data.name || name,
            about: data.about || about,
            avatarBlobId: profile.data.avatarBlobId,
          },
        },
        {
          onSuccess: () => invaldiateProfileQuery(did!),
        }
      );
    }
  };

  useEffect(() => {
    setname(profile?.data.name || "");
    setAbout(profile?.data.about || "");
  }, [isFetching]);

  return (
    <div className="h-full w-full flex justify-center items-start pt-[100px] gap-6">
      <ProfileImgSelector
        file={profile?.avatarImageBlob || null}
        setFile={() => {}}
        height={150}
        width={150}
        onSave={(file) => {
          updateProfile({
            newAvatarImage: file,
          });
        }}
        viewOnly={did !== didInRoute}
      />

      <div className="flex flex-col gap-2 w-[425px]">
        <div className="w-fit">
          {profile && profile.data.name && profile.data.name !== "" ? (
            <InlineEdit
              disabled={did !== didInRoute}
              defaultValue={name}
              readView={
                <h3 className="text-2xl font-semibold tracking-tight min-h-6 min-w-[200px]">
                  {name}
                </h3>
              }
              editView={({ fieldProps }) => (
                <Input
                  {...fieldProps}
                  autoFocus
                  placeholder="Name"
                  className="min-w-[250px]"
                />
              )}
              onConfirm={(value) => {
                updateProfile({
                  name: value,
                });
              }}
            />
          ) : (
            <Input
              value={name}
              placeholder="Name"
              onChange={(e) => {
                setname(e.target.value);

                if (nameTimeout) clearTimeout(nameTimeout);

                const timeout = setTimeout(() => {
                  updateProfile({
                    name: e.target.value,
                  });
                }, 1000);
                setNameTimeout(timeout);
              }}
              className="min-w-[200px]"
            />
          )}
        </div>

        {profile && profile.data.about && profile.data.about !== "" ? (
          <InlineEditTextarea
            disabled={did !== didInRoute}
            defaultValue={about}
            readView={
              <p className="leading-7 [&:not(:first-child)]:mt-6 min-h-[75px]">
                {about}
              </p>
            }
            editView={({ fieldProps }) => (
              <Textarea
                {...fieldProps}
                autoFocus
                placeholder="About"
                className="max-h-[250px]"
              />
            )}
            onConfirm={(value) => {
              if (value === profile?.data.about) return;
              setAbout(value);
              updateProfile({
                about: value,
              });
            }}
          />
        ) : (
          <Textarea
            value={about}
            placeholder="About"
            onChange={(e) => {
              setAbout(e.target.value);

              if (aboutTimeout) clearTimeout(aboutTimeout);

              const timeout = setTimeout(() => {
                updateProfile({
                  about: e.target.value,
                });
              }, 1000);
              setAboutTimeout(timeout);
            }}
            className="max-h-[250px]"
          />
        )}
      </div>
    </div>
  );
}
