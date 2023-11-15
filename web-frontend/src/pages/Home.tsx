import { Chat } from "@/components/Chat";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import TopLoader from "@/components/TopLoader";
import useProfileStore from "@/hooks/stores/useProfileStore";
import { Button } from "@/components/ui/button";
import { LogOut, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuthStore from "@/hooks/stores/useAuthStore";

export function Home() {
  const navigate = useNavigate();
  const profile = useProfileStore((state) => state.profile);
  const fetched = useProfileStore((state) => state.fetched);
  const accessToken = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.actions.setToken);

  useEffect(() => {
    console.log("profile", profile);
    if ((!profile && fetched) || !accessToken) navigate("/welcome");
  }, [profile, fetched]);

  return (
    <>
      <TopLoader />
      <div className={`h-screen w-screen flex flex-col items-center relative`}>
        <DropdownMenu>
          <DropdownMenuTrigger className="absolute top-2 right-14 z-30 rounded-xl">
            <Button
              variant={"ghost"}
              onClick={() => {}}
              size={"icon"}
              className="rounded-xl"
            >
              {/* <LogOut className="w-3 h-3" /> */}
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-xl">
            <DropdownMenuItem
              className="rounded-xl"
              onClick={() => {
                setToken(null);
                navigate("/welcome");
              }}
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* <div className="h-16 bg-black w-full flex items-center pl-8 gap-2">
          <KeyLogo height={35} width={35} />

          <h3 className="scroll-m-20 text-2xl font-semibold text-white tracking-tight">
            Netonomy
          </h3>
        </div> */}

        <div className={`h-full w-full flex items-center p-14 gap-10 relative`}>
          <div className="flex flex-1 w-full flex-row items-center h-full">
            <Outlet />
          </div>

          <div className="w-[475px] h-full hidden lg:flex">
            <Chat />
          </div>
        </div>
      </div>
    </>
  );
}
