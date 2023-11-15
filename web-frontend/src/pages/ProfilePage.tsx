import { Button } from "@/components/ui/button";
import { ProfileWidet } from "@/components/widgets/ProfileWidget";
import { CopyCheckIcon, Share } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const [linkCopied, setLinkCopied] = useState(false);

  return (
    <div
      className={`h-screen w-screen flex items-center p-8 gap-10 relative justify-center`}
    >
      <Button
        className="absolute top-8 right-8"
        size={"sm"}
        onClick={() => {
          // Copy the URL to the clipboard
          navigator.clipboard.writeText(window.location.href);
          setLinkCopied(true);

          // Reset the link copied state
          setTimeout(() => {
            setLinkCopied(false);
          }, 2000);
        }}
      >
        {linkCopied ? (
          <>
            <CopyCheckIcon className="w-4 h-4 mr-2" />
            Copied Link
          </>
        ) : (
          <>
            <Share className="w-4 h-4 mr-2" />
            Share
          </>
        )}
      </Button>

      <ProfileWidet />
    </div>
  );
}
