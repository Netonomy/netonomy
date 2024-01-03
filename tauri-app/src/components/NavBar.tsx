import { Bot, Box, User } from "lucide-react";
import NavBarItem from "./NavBarItem";
import { NavBarOptions } from "@/enums/NavBarOptions";

export default function NavBar() {
  return (
    <div className="flex w-full h-16 items-center justify-center gap-12 md:h-full md:w-16 md:flex-col">
      {/* <NavBarItem icon={<MessageSquare />} item={NavBarOptions.messages} /> */}

      <NavBarItem icon={<Box />} item={NavBarOptions.storage} />

      <NavBarItem icon={<Bot />} item={NavBarOptions.ai} />

      <NavBarItem icon={<User />} item={NavBarOptions.profile} />
    </div>
  );
}
