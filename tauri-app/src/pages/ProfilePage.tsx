import ProfileImgSelector from "@/components/ProfileImgSelector";
import InlineEdit from "@/components/ui/InlineEdit";
import InlineEditTextarea from "@/components/ui/InlineEditTextArea";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useProfileStore from "@/stores/useProfileStore";
import useWeb5Store from "@/stores/useWeb5Store";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProfilePage() {
  const { did: didInRoute } = useParams();
  const did = useWeb5Store((state) => state.did);
  const profile = useProfileStore((state) => state.profile);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const avatarImage = useProfileStore((state) => state.avatarImage);
  const updateProfile = useProfileStore((state) => state.actions.updateProfile);
  const [name, setname] = useState("");
  const [about, setAbout] = useState("");

  const [aboutTimeout, setAboutTimeout] = useState<NodeJS.Timeout | null>(null);
  const [nameTimeout, setNameTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setname(profile?.name || "");
    setAbout(profile?.about || "");
  }, [profile]);

  useEffect(() => {
    fetchProfile(didInRoute);
  }, []);

  return (
    <div className="h-full w-full flex justify-center items-start pt-[100px] gap-6">
      <ProfileImgSelector
        file={avatarImage}
        setFile={() => {}}
        height={150}
        width={150}
        onSave={(file) => {
          if (file) {
            updateProfile({
              newAvatarImage: file,
            });
          }
        }}
        viewOnly={did !== didInRoute}
      />

      <div className="flex flex-col gap-2 w-[425px]">
        <div className="w-fit">
          {profile && profile.name ? (
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
                if (value === profile?.name) return;
                setname(value);
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

                if (e.target.value === profile?.name) return;
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

        {profile && profile.about ? (
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
                // className="min-h-[150px] max-h-[250px]"
              />
            )}
            onConfirm={(value) => {
              if (value === profile?.about) return;
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

              if (e.target.value === profile?.about) return;
              if (aboutTimeout) clearTimeout(aboutTimeout);

              const timeout = setTimeout(() => {
                updateProfile({
                  about: e.target.value,
                });
              }, 1000);
              setAboutTimeout(timeout);
            }}
            // className="min-h-[150px] max-h-[250px]"
          />
        )}
      </div>
    </div>
  );
}
