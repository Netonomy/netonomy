import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import MessagesPreview from "@/components/messages/preview/MessagesPreview";
import { NavBarOptions } from "@/enums/NavBarOptions";
import useAppStore from "@/stores/useAppStore";

export default function HomePage() {
  const selectedNavBarItem = useAppStore((state) => state.navBarItem);
  return (
    <div className="h-screen w-screen flex flex-col">
      <Header />
      <div
        className={`flex flex-1 flex-col items-center relative md:flex-row-reverse`}
      >
        <div className="flex flex-1 m-4 h-full w-full">
          {selectedNavBarItem === NavBarOptions.messages && <MessagesPreview />}
        </div>

        <NavBar />
      </div>
    </div>
  );
}
