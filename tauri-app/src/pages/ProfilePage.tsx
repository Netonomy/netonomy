import InlineEdit from "@/components/ui/InlineEdit";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import useProfileStore from "@/stores/useProfileStore";
import { Profile } from "@/types/Profile";
import { User } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const profile = useProfileStore((state) => state.profile);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const avatarImage = useProfileStore((state) => state.avatarImage);
  const updateProfile = useProfileStore((state) => state.actions.updateProfile);

  const [name, setname] = useState("");
  const [about, setAbout] = useState("");

  useEffect(() => {
    setname(profile?.name || "");
    setAbout(profile?.about || "");
  }, [profile?.name]);

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="h-full w-full flex justify-center pt-[100px] gap-6">
      <div className="h-32 w-32 lg:h-44 lg:w-44 cursor-pointer">
        <Avatar className="h-full w-full">
          {avatarImage && (
            <img
              src={URL.createObjectURL(avatarImage)}
              className="h-full w-full"
            />
          )}

          <AvatarFallback>
            <User className="h-14 w-14" />
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col gap-2 w-[425px]">
        <div className="w-fit">
          <InlineEdit
            defaultValue={profile?.name || ""}
            readView={
              <h3 className="text-2xl font-semibold tracking-tight min-h-6">
                {name}
              </h3>
            }
            editView={({ fieldProps }) => <Input {...fieldProps} autoFocus />}
            onConfirm={(value) => {
              setname(value);
              const updatedProfile = { ...profile, name: value };
              updateProfile(updatedProfile);
            }}
          />
        </div>

        <InlineEdit
          defaultValue={profile?.about || ""}
          readView={
            <p className="leading-7 [&:not(:first-child)]:mt-6">{about}</p>
          }
          editView={({ fieldProps }) => <Input {...fieldProps} autoFocus />}
          onConfirm={(value) => {
            setAbout(value);
            const updatedProfile: Profile = { ...profile!, about: value };
            updateProfile(updatedProfile);
          }}
        />
      </div>
    </div>
  );
}
