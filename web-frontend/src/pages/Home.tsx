import { Chat } from "@/components/Chat";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import TopLoader from "@/components/TopLoader";
import useProfileStore from "@/hooks/stores/useProfileStore";
import { LogOut, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuthStore from "@/hooks/stores/useAuthStore";
import { ProfileWidet } from "@/components/widgets/ProfileWidget";
import CredentialsWidget from "@/components/widgets/CredentialsWidget";
import { StorageWidget } from "@/components/widgets/StorageWidget";
import FinancesWidget from "@/components/widgets/FinancesWidget";

export function Home() {
  const navigate = useNavigate();
  const profile = useProfileStore((state) => state.profile);
  const fetched = useProfileStore((state) => state.fetched);
  const accessToken = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.actions.setToken);

  useEffect(() => {
    if ((!profile && fetched) || !accessToken) navigate("/welcome");
  }, [profile, fetched]);

  return (
    <>
      <TopLoader />
      <div className={`h-screen w-screen flex flex-col items-center relative`}>
        <DropdownMenu>
          <DropdownMenuTrigger className="absolute top-2 right-14 z-30 rounded-xl ">
            <div className="h-10 w-10 flex items-center justify-center hover:bg-primary-foreground rounded-xl">
              <MoreHorizontal className="w-3 h-3" />
            </div>
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
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-dashboardLg grid-rows-5 w-full h-full">
            <ProfileWidet />
            <StorageWidget />
            <Chat />
            <CredentialsWidget />
            {/* <FinancesWidget /> */}
          </div>
        </div>
      </div>
    </>
  );
}
