import Web5Context from "@/Web5Provider";
import { Chat } from "@/components/Chat";
import { ProfileWidet } from "@/components/widgets/ProfileWidget";
import { StorageWidget } from "@/components/widgets/StorageWidget";
import { useContext } from "react";
import { Splash } from "./Splash";

export function Home() {
  const web5Context = useContext(Web5Context);
  console.log(web5Context);
  return (
    <>
      {web5Context ? (
        <div className="h-screen w-screen flex items-center p-6">
          <div className="flex-1 grid grid-cols-3 gap-4 h-full">
            <ProfileWidet />
            {/* Add more widgets here */}
            <StorageWidget />
          </div>

          <div className="w-[475px] h-full">
            <Chat />
          </div>
        </div>
      ) : (
        <Splash />
      )}
    </>
  );
}
