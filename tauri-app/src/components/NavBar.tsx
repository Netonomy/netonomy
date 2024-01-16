import { Folder, User } from "lucide-react";
import NavBarItem from "./NavBarItem";
import { NavBarOptions } from "@/enums/NavBarOptions";

export default function NavBar() {
  return (
    <div className="flex w-full h-16 items-center gap-4 md:h-full md:w-[65px] md:flex-col md:py-4 md:border-r-[1.5px]">
      {/* <NavBarItem icon={<MessageSquare />} item={NavBarOptions.messages} /> */}

      <NavBarItem icon={<Folder />} item={NavBarOptions.storage} />

      {/* <NavBarItem icon={<Bot />} item={NavBarOptions.ai} /> */}

      <div className="flex-1" />

      <NavBarItem icon={<User />} item={NavBarOptions.profile} />
    </div>
  );
}
