import { Bot, Folder, User } from "lucide-react";
import NavBarItem from "./NavBarItem";
import { NavBarOption } from "@/enums/NavBarOption";
import useIsTauriApp from "@/hooks/useIsTauriApp";
import { useLocation } from "react-router-dom";

export default function NavBar() {
  const isTauriApp = useIsTauriApp();

  const selcetedNavBarItem = useLocation().pathname.replace("/", "");

  return (
    <div className="flex w-full h-16 items-center gap-4 md:h-full md:w-[65px] md:flex-col md:py-4 md:border-r-[1.5px]">
      {/* <NavBarItem icon={<MessageSquare />} item={NavBarOptions.messages} /> */}

      <NavBarItem
        icon={<Folder />}
        item={NavBarOption.storage}
        selected={selcetedNavBarItem === ""}
      />

      {isTauriApp && (
        <NavBarItem
          icon={<Bot />}
          item={NavBarOption.ai}
          selected={selcetedNavBarItem === "ai"}
        />
      )}

      <div className="flex-1" />

      <NavBarItem
        icon={<User />}
        item={NavBarOption.profile}
        selected={selcetedNavBarItem === "profile"}
      />
    </div>
  );
}
