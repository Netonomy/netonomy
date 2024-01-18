import { Bot, Folder, User } from "lucide-react";
import NavBarItem from "./NavBarItem";
import { NavBarOption } from "@/enums/NavBarOption";
import useIsTauriApp from "@/hooks/useIsTauriApp";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "./ui/card";

export default function NavBar() {
  const isTauriApp = useIsTauriApp();

  const selcetedNavBarItem = useLocation().pathname.replace("/", "");

  return (
    <Card className="w-auto h-16 items-center gap-4 md:w-[60px] absolute bottom-2 md:top-3 md:left-3 md:bottom-3 md:h-auto ">
      <CardContent className="flex md:flex-col justify-center items-center h-full p-4 w-full md:py-4 md:justify-start gap-4">
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

        <div className="hidden md:flex md:flex-1" />

        <NavBarItem
          icon={<User />}
          item={NavBarOption.profile}
          selected={selcetedNavBarItem === "profile"}
        />
      </CardContent>
    </Card>
  );
}
