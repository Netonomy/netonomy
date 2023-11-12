import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState } from "react";
import { CheckCircle, CopyIcon, Pencil, X } from "lucide-react";
import useDinger from "@/hooks/useDinger";
import { DingsDialog } from "../DingsDialog";
import { SendDingDialog } from "../SendDingDialog";
import TappableCardWrapper from "../TappableCardWrapper";
import { useNavigate } from "react-router-dom";
import EditingProfileForm from "../EditingProfileForm";
import useWeb5Store from "@/hooks/stores/useWeb5Store";
import useProfileStore from "@/hooks/stores/useProfileStore";

export function ProfileWidet() {
  const navigate = useNavigate();
  const profile = useProfileStore((state) => state.profile);
  const profileFetched = useProfileStore((state) => state.fetched);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);

  const [copied, setCopied] = useState(false);

  const did = useWeb5Store((state) => state.did);

  const [editng, setEditing] = useState(false);

  const { dings } = useDinger();

  useEffect(() => {
    if (!profileFetched) {
      fetchProfile();
    }
  }, []);

  return (
    <TappableCardWrapper>
      <Card
        className="w-[425px] h-min rounded-xl shadow-lg"
        onClick={() => navigate(`/profile/test`)}
      >
        <CardContent className="flex items-center justify-center gap-4 lg:flex-col p-4 relative">
          {!editng ? (
            <div
              className="absolute top-4 right-4"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();

                setEditing(true);
              }}
            >
              <Pencil className="w-5 h-5" />
            </div>
          ) : (
            <div
              className="absolute top-4 right-4"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();

                setEditing(false);
              }}
            >
              <X className="w-5 h-5" />
            </div>
          )}

          {!editng ? (
            <>
              <div className="h-12 w-12 lg:h-40 lg:w-40 relative">
                <Avatar className="h-full w-full">
                  {profileFetched ? (
                    <>{profile?.image && <AvatarImage src={profile.image} />}</>
                  ) : (
                    <Skeleton className="h-full w-full" />
                  )}
                  {/* <AvatarFallback>
              {profile?.name?.split(" ")[0]?.charAt(0)}
              {profile?.name?.split(" ")[1]?.charAt(0)}
            </AvatarFallback> */}
                </Avatar>

                {dings.length > 0 && <DingsDialog />}
              </div>

              {profileFetched && profile ? (
                <div className="flex gap-2">
                  {/* <div className="font-light text-[31px]">Hello </div> */}
                  <div className="font-semibold text-[31px]">
                    {profile.name}
                  </div>
                </div>
              ) : (
                <Skeleton className="h-6 w-[150px]" />
              )}
            </>
          ) : (
            <EditingProfileForm />
          )}

          {/* {did ? (
            <div className="flex items-center gap-2">
              🔑
              <p className="text-sm text-muted-foreground max-w-[250px] truncate">
                Digital Identifier (DID)
              </p>
              {copied ? (
                <CheckCircle className="h-4 w-4 cursor-pointer text-green-600" />
              ) : (
                <CopyIcon
                  className="h-4 w-4 cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();

                    if (did) {
                      navigator.clipboard.writeText(did).then(() => {
                        setCopied(true);

                        setTimeout(() => setCopied(false), 3000);
                      });
                    }
                  }}
                />
              )}
            </div>
          ) : (
            <Skeleton className="h-6 w-[150px]" />
          )} */}

          {/* <div className="flex w-full items-center justify-center gap-4">
            <SendDingDialog />

          </div> */}
        </CardContent>
      </Card>
    </TappableCardWrapper>
  );
}
