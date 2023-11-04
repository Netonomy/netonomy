import useProfile from "@/hooks/useProfile";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";

export function ProfileWidet() {
  const { profile } = useProfile();

  return (
    <Card className="w-[425px] h-min rounded-xl shadow-lg">
      <CardContent className="flex items-center justify-center gap-4 lg:flex-col p-4">
        <div className="h-12 w-12 lg:h-40 lg:w-40">
          <Avatar className="h-full w-full">
            {profile?.image && <AvatarImage src={profile.image} />}
            <AvatarFallback>
              {profile?.name?.split(" ")[0]?.charAt(0)}
              {profile?.name?.split(" ")[1]?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        {profile && (
          <div className="flex gap-2">
            <div className="font-light text-[31px]">Hello </div>
            <div className="font-semibold text-[31px]">
              {profile.name.split(" ")[0]}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
