import PageContainer from "@/components/PageContainer";
import NavBar from "@/components/NavBar";
import { Outlet } from "react-router-dom";

export default function HomePage() {
  return (
    <PageContainer>
      <div
        className={`flex flex-1 flex-col items-center relative md:flex-row-reverse`}
      >
        <div className="flex flex-1 h-full w-full md:p-2 md:m-2 md:ml-[80px]">
          <Outlet />
        </div>

        <NavBar />
      </div>
    </PageContainer>
  );
}
