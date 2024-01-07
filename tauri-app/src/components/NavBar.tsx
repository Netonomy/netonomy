import { Bot, Box, User } from "lucide-react";
import NavBarItem from "./NavBarItem";
import { NavBarOptions } from "@/enums/NavBarOptions";

export default function NavBar() {
  return (
    <div className="flex w-full h-16 items-center gap-4 md:h-full md:w-16 md:flex-col md:py-4 bg-myGrey">
      {/* <NavBarItem icon={<MessageSquare />} item={NavBarOptions.messages} /> */}

      <NavBarItem icon={<Box />} item={NavBarOptions.storage} />

      <NavBarItem icon={<Bot />} item={NavBarOptions.ai} />

      <div className="flex-1" />

      <NavBarItem icon={<User />} item={NavBarOptions.profile} />
    </div>
  );
}
