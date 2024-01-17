import PageContainer from "@/components/PageContainer";
import NavBar from "@/components/NavBar";
import useProfileStore from "@/stores/useProfileStore";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const profile = useProfileStore((state) => state.profile);
  const fetched = useProfileStore((state) => state.fetched);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);

  useEffect(() => {
    fetchProfile();
    if (!profile && fetched) navigate("/create-profile");
  }, [profile, fetched]);

  return (
    <PageContainer>
      <div
        className={`flex flex-1 flex-col items-center relative md:flex-row-reverse`}
      >
        <div className="flex flex-1 h-full w-full md:p-2 md:m-2">
          <Outlet />
        </div>

        <NavBar />
      </div>
    </PageContainer>
  );
}
