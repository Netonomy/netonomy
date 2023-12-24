import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import TopLoader from "@/components/TopLoader";
import MessagesPreview from "@/components/messages/preview/MessagesPreview";
import Storage from "@/components/storage/Storage";
import { NavBarOptions } from "@/enums/NavBarOptions";
import useAppStore from "@/stores/useAppStore";
import useProfileStore from "@/stores/useProfileStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfilePage from "./ProfilePage";

export default function HomePage() {
  const navigate = useNavigate();
  const selectedNavBarItem = useAppStore((state) => state.navBarItem);
  const profile = useProfileStore((state) => state.profile);
  const fetched = useProfileStore((state) => state.fetched);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);

  useEffect(() => {
    fetchProfile();
    if (!profile && fetched) navigate("/create-profile");
  }, [profile, fetched]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <TopLoader />
      <Header />
      <div
        className={`flex flex-1 flex-col items-center relative md:flex-row-reverse`}
      >
        <div className="flex flex-1 m-4 h-full w-full">
          {selectedNavBarItem === NavBarOptions.messages && <MessagesPreview />}
          {selectedNavBarItem === NavBarOptions.storage && <Storage />}
          {selectedNavBarItem === NavBarOptions.profile && <ProfilePage />}
        </div>

        <NavBar />
      </div>
    </div>
  );
}
