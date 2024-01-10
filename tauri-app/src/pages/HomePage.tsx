// import NavBar from "@/components/NavBar";
import Storage from "@/components/storage/Storage";
import { NavBarOptions } from "@/enums/NavBarOptions";
import useAppStore from "@/stores/useAppStore";
// import useProfileStore from "@/stores/useProfileStore";
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import ProfilePage from "./ProfilePage";
import Chat from "@/components/messages/chat/Chat";
import PageContainer from "@/components/PageContainer";
// import NavBar from "@/components/NavBar";

export default function HomePage() {
  // const navigate = useNavigate();
  const selectedNavBarItem = useAppStore((state) => state.navBarItem);
  // const profile = useProfileStore((state) => state.profile);
  // const fetched = useProfileStore((state) => state.fetched);
  // const fetchProfile = useProfileStore((state) => state.fetchProfile);

  // useEffect(() => {
  //   fetchProfile();
  //   if (!profile && fetched) navigate("/create-profile");
  // }, [profile, fetched]);

  return (
    <PageContainer>
      {/* <Header /> */}
      <div
        className={`flex flex-1 flex-col items-center relative md:flex-row-reverse`}
      >
        <div className="flex flex-1 h-full w-full md:p-2 md:m-4">
          {/* {selectedNavBarItem === NavBarOptions.messages && <MessagesPreview />} */}
          {selectedNavBarItem === NavBarOptions.storage && <Storage />}
          {selectedNavBarItem === NavBarOptions.ai && (
            <Chat showBackButton={false} />
          )}

          {selectedNavBarItem === NavBarOptions.profile && <ProfilePage />}
        </div>

        {/* <NavBar /> */}
      </div>
    </PageContainer>
  );
}
