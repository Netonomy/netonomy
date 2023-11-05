import { Chat } from "@/components/Chat";
import { useEffect } from "react";
import useProfile from "@/hooks/useProfile";
import { Outlet, useNavigate } from "react-router-dom";
import TopLoader from "@/components/TopLoader";
import { useAtom } from "jotai";
import { loadingAtom } from "@/state/loadingAtom";
// import KeyLogo from "@/components/KeyLogo";

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
      <div className={`h-screen w-screen flex flex-col items-center relative`}>
        {/* <div className="h-16 bg-black w-full flex items-center pl-8 gap-2">
          <KeyLogo height={35} width={35} />

          <h3 className="scroll-m-20 text-2xl font-semibold text-white tracking-tight">
            Netonomy
          </h3>
        </div> */}

        <div className={`h-full w-full flex items-center p-8 gap-10 relative`}>
          <div className="flex flex-1 w-full flex-row items-center mb-4 h-full">
            <Outlet />
          </div>

          <div className="w-[475px] h-full">
            <Chat />
          </div>
        </div>
      </div>
    </>
  );
}
