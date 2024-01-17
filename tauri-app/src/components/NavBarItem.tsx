import { NavBarOption } from "@/enums/NavBarOption";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export default function NavBarItem({
  icon,
  item,
  selected,
}: {
  icon: ReactNode;
  item: NavBarOption;
  selected?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div
      className={`flex flex-col items-center gap-2 p-3 rounded-sm cursor-pointer drop-shadow-lg ${
        selected && "bg-secondary"
      }`}
      onClick={() => {
        if (item === NavBarOption.storage) navigate("/");
        else navigate(`/${item}`);
      }}
    >
      <div className={`${selected ? "text-primary" : "text-gray-400"}`}>
        {icon}
      </div>

      <div
        className={`w-1 h-1 rounded-full md:hidden ${
          selected ? "bg-primary" : "bg-transparent"
        }`}
      />
    </div>
  );
}
