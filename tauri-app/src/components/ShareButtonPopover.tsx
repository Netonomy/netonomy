import { Check, Copy, Lock, Share } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import useStorageStore, { DigitalDocument } from "@/stores/useFileStorageStore";
import { useState } from "react";

export default function ShareButtonPopover() {
  const file = useStorageStore((state) => state.file);
  const [linkCopied, setLinkCopied] = useState(false);
  const updateFile = useStorageStore((state) => state.actions.updateFileItem);

  return (
    <Popover>
      <PopoverTrigger>
        <Button className="m-4 gap-1">
          <Share className="h-3 w-3" /> Share
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <div className="text-lg font-semibold">View Access</div>

          <div className="flex flex-col rounded border">
            <div
              className="w-full flex justify-start items-center rounded p-2 cursor-pointer border-b-[1px] hover:bg-primary-foreground"
              onClick={() => {
                updateFile(
                  (file?.data as DigitalDocument).identifier,
                  file?.data as DigitalDocument,
                  false
                );
              }}
            >
              <div className="flex flex-1 items-center gap-1">
                <Lock className="h-3 w-3" /> Private
              </div>
              {!file?.record.published && <Check className="h-3 w-3" />}{" "}
            </div>

            <div
              className="w-full flex justify-start items-center rounded p-2 cursor-pointer hover:bg-primary-foreground"
              onClick={() => {
                updateFile(
                  (file?.data as DigitalDocument).identifier,
                  file?.data as DigitalDocument,
                  true
                );
              }}
            >
              <div className="flex flex-1 items-center gap-1">
                <Share className="h-3 w-3" /> Share
              </div>

              {file?.record.published && <Check className="h-3 w-3" />}
            </div>
          </div>

          {file?.record.published && (
            <div
              className="flex items-center ml-4 cursor-pointer"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                if (
                  (file.data as DigitalDocument).encodingFormat ===
                  "application/pdf"
                )
                  navigator.clipboard.writeText(
                    `http://localhost:1420/#/pdf/${
                      (file.data as DigitalDocument).identifier
                    }`
                  );
                else
                  navigator.clipboard.writeText(
                    `${import.meta.env.VITE_DWN_URL}/${
                      file.record.author
                    }/records/${(file.data as DigitalDocument).fileBlobId}`
                  );

                setLinkCopied(true);

                setTimeout(() => {
                  setLinkCopied(false);
                }, 2000);
              }}
            >
              {linkCopied ? (
                <Check className="w-2 h-2 mr-2 text-inherit" />
              ) : (
                <Copy className="w-2 h-2 mr-2 text-inherit" />
              )}

              {linkCopied ? (
                <p className="text-sm text-muted-foreground">Link Copied!</p>
              ) : (
                <p className="text-sm text-muted-foreground">Copy Link</p>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
