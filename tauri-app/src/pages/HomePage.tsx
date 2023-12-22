import NavBar from "@/components/NavBar";
import { Outlet } from "react-router-dom";

export default function HomePage() {
  return (
    <>
      {/* <TopLoader /> */}
      <div
        className={`h-screen w-screen flex flex-col items-center relative md:flex-row-reverse`}
      >
        <div className="flex flex-1 m-4 h-full">
          <Outlet />
        </div>

        <NavBar />
      </div>
    </>
  );
}
