import { Chat } from "@/components/Chat";
import { ProfileWidet } from "@/components/widgets/ProfileWidget";
import { StorageWidget } from "@/components/widgets/StorageWidget";
import { useEffect } from "react";
import useProfile from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import TopLoader from "@/components/TopLoader";

export function Home() {
  const navigate = useNavigate();
  const { profile, fetched } = useProfile();

  useEffect(() => {
    if (!profile && fetched) navigate("/profile");
  }, [profile, fetched]);

  return (
    <>
      <TopLoader />
      <div className="h-screen w-screen flex items-center p-6 gap-4 relative">
        <div className="flex flex-1 h-full gap-4">
          <ProfileWidet />
          <StorageWidget />
        </div>

        <div className="w-[475px] h-full">
          <Chat />
        </div>
      </div>
    </>
  );
}
