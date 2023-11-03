import { Chat } from "@/components/Chat";
import { useEffect } from "react";
import useProfile from "@/hooks/useProfile";
import { Outlet, useNavigate } from "react-router-dom";
import TopLoader from "@/components/TopLoader";
import { useAtom } from "jotai";
import { loadingAtom } from "@/state/loadingAtom";

export function Home() {
  const navigate = useNavigate();
  const { profile, fetched } = useProfile();

  const [loading] = useAtom(loadingAtom);

  useEffect(() => {
    if (!profile && fetched) navigate("/profile");
  }, [profile, fetched]);

  return (
    <>
      <TopLoader />
      <div
        className={`h-screen w-screen flex items-center p-8 gap-10 relative`}
      >
        <div className="flex flex-1 h-full gap-10">
          <Outlet />
        </div>

        <div className="w-[475px] h-full">
          <Chat />
        </div>
      </div>
    </>
  );
}
