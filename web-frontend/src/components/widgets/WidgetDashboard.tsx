import CredentialsWidget from "./CredentialsWidget";
import { ProfileWidet } from "./ProfileWidget";
import { StorageWidget } from "./StorageWidget";

export default function WidgetDashboard() {
  return (
    <div className="flex flex-1 w-full flex-row items-center h-full gap-10">
      <div className="hidden lg:flex flex-col items-center w-[425px] h-full gap-10">
        <ProfileWidet />
        <CredentialsWidget />
      </div>

      <div className="flex flex-col items-center w-full h-full">
        <StorageWidget />
      </div>
    </div>
  );
}
