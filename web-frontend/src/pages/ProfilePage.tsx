import { ProfileWidet } from "@/components/widgets/ProfileWidget";

export default function ProfilePage() {
  return (
    <div
      className={`h-screen w-screen flex items-center p-8 gap-10 relative justify-center`}
    >
      <ProfileWidet />
    </div>
  );
}
