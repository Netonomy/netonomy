import { useState } from "react";
import ProfileImgSelector from "./ProfileImgSelector";
import { Input } from "./ui/input";

export default function EditingProfileForm() {
  const [profileImg, setProfileImg] = useState<File | null>(null);

  return (
    <>
      <div className="h-12 w-12 lg:h-40 lg:w-40 relative">
        <ProfileImgSelector file={profileImg} setFile={setProfileImg} />
      </div>

      <div className="flex gap-2">
        {/* <div className="font-light text-[31px]">Hello </div> */}
        <Input placeholder="Name" className="w-full" />
      </div>
    </>
  );
}
