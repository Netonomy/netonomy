import { NavBarOption } from "@/enums/NavBarOption";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import useWeb5Store from "@/features/app/useWeb5Store";

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
  const did = useWeb5Store((state) => state.did);

  return (
    <Button
      variant={selected ? "default" : "outline"}
      size={"icon"}
      className="text-foreground"
      onClick={() => {
        if (item === NavBarOption.storage) navigate("/");
        else if (item === NavBarOption.profile) navigate(`/profile/${did}`);
        else navigate(`/${item}`);
      }}
    >
      {icon}
    </Button>
  );
}
