import { NavBarOptions } from "@/enums/NavBarOptions";
import useAppStore from "@/stores/useAppStore";
import { ReactNode } from "react";

export default function NavBarItem({
  icon,
  item,
}: {
  icon: ReactNode;
  item: NavBarOptions;
}) {
  const selectedNavBar = useAppStore((state) => state.navBarItem);
  const setNavBarItem = useAppStore((state) => state.actions.setNavBarItem);

  return (
    <div
      className="flex flex-col items-center gap-2 cursor-pointer"
      onClick={() => setNavBarItem(item)}
    >
      <div
        className={`${
          selectedNavBar === item ? "text-primary" : "text-gray-400"
        }`}
      >
        {icon}
      </div>

      <div
        className={`w-1 h-1 rounded-full ${
          selectedNavBar === item ? "bg-primary" : "bg-transparent"
        }`}
      />
    </div>
  );
}
