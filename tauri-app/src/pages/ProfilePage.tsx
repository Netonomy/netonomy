import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import useProfileStore from "@/stores/useProfileStore";

export default function ProfilePage() {
  const profile = useProfileStore((state) => state.profile);
  const profileFetched = useProfileStore((state) => state.fetched);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="h-12 w-12 lg:h-44 lg:w-44 relative">
        <Avatar className="h-full w-full">
          {profileFetched ? (
            <img src={profile?.image} className="h-full w-full" />
          ) : (
            // <>{profile?.image && <AvatarImage src={profile.image} />}</>
            <Skeleton className="h-full w-full" />
          )}
          {/* <AvatarFallback>
              {profile?.name?.split(" ")[0]?.charAt(0)}
              {profile?.name?.split(" ")[1]?.charAt(0)}
            </AvatarFallback> */}
        </Avatar>
      </div>
    </div>
  );
}
