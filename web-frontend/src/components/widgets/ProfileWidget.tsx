import useProfile from "@/hooks/useProfile";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { useContext, useState } from "react";
import Web5Context from "@/Web5Provider";
import { CheckCircle, CopyIcon } from "lucide-react";
import useDinger from "@/hooks/useDinger";
import { DingsDialog } from "../DingsDialog";
import { SendDingDialog } from "../SendDingDialog";
import TappableCardWrapper from "../TappableCardWrapper";
import { useNavigate } from "react-router-dom";

export function ProfileWidet() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const web5Context = useContext(Web5Context);
  const [copied, setCopied] = useState(false);

  const { dings } = useDinger();

  function copyDidToClipboard() {
    if (web5Context?.did) {
      navigator.clipboard.writeText(web5Context.did).then(() => {
        setCopied(true);

        setTimeout(() => setCopied(false), 3000);
      });
    }
  }

  return (
    <TappableCardWrapper>
      <Card
        className="w-[425px] h-min rounded-xl shadow-lg"
        onClick={() => navigate(`/profile/test`)}
      >
        <CardContent className="flex items-center justify-center gap-4 lg:flex-col p-4">
          <div className="h-12 w-12 lg:h-40 lg:w-40 relative">
            <Avatar className="h-full w-full">
              {profile?.image && <AvatarImage src={profile.image} />}
              {/* <AvatarFallback>
              {profile?.name?.split(" ")[0]?.charAt(0)}
              {profile?.name?.split(" ")[1]?.charAt(0)}
            </AvatarFallback> */}
            </Avatar>

            {dings.length > 0 && <DingsDialog />}
          </div>

          {profile && (
            <div className="flex gap-2">
              <div className="font-light text-[31px]">Hello </div>
              <div className="font-semibold text-[31px]">
                {profile.name.split(" ")[0]}
              </div>
            </div>
          )}

          {web5Context?.did ? (
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

                    if (web5Context?.did) {
                      navigator.clipboard
                        .writeText(web5Context.did)
                        .then(() => {
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
          )}

          <SendDingDialog />
        </CardContent>
      </Card>
    </TappableCardWrapper>
  );
}
