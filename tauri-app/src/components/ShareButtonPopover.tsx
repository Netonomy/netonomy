import { Check, Copy, Lock, Share } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import useStorageStore, { DigitalDocument } from "@/stores/useFileStorageStore";
import { useState } from "react";
import { motion } from "framer-motion";
import { getFileType } from "@/lib/utils";

export default function ShareButtonPopover() {
  const file = useStorageStore((state) => state.file);
  const [linkCopied, setLinkCopied] = useState(false);
  const updateFile = useStorageStore((state) => state.actions.updateFileItem);

  return (
    <Popover>
      <PopoverTrigger>
        <Button className="gap-[6px] text-sm">
          {file?.record.published ? (
            <>
              <Share className="h-3 w-3" /> Share
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" /> Share
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] mr-4">
        <div className="flex flex-col gap-2 transition-all">
          <div className="text-lg font-semibold">View Access</div>

          <div className="flex flex-col rounded-sm border overflow-hidden ">
            <div
              className="w-full flex flex-col justify-start items-start rounded p-2 cursor-pointer border-b-[1px] hover:bg-secondary-hover relative"
              onClick={() => {
                updateFile(
                  (file?.data as DigitalDocument).identifier,
                  file?.data as DigitalDocument,
                  false
                );
              }}
            >
              <div className="w-full flex justify-start items-center ">
                <div
                  className={`flex flex-1 items-center gap-1 text-sm ${
                    !file?.record.published ? "font-semibold" : "font-normal"
                  }`}
                >
                  <Lock className="h-4 w-4" /> Private
                </div>
              </div>

              <p className="text-sm text-muted-foreground">Only you can see</p>

              <div className="absolute right-2 flex items-center ">
                {!file?.record.published && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    exit={{ opacity: 0 }}
                    className="rounded-full bg-foreground p-1"
                  >
                    <Check
                      className="h-3 w-3 text-secondary"
                      fontWeight={"bold"}
                    />
                  </motion.div>
                )}
              </div>
            </div>

            <div
              className="w-full flex flex-col justify-start items-start rounded p-2 cursor-pointer hover:bg-secondary-hover relative"
              onClick={() => {
                updateFile(
                  (file?.data as DigitalDocument).identifier,
                  file?.data as DigitalDocument,
                  true
                );
              }}
            >
              <div className="w-full flex justify-start items-center ">
                <div
                  className={`flex flex-1 items-center gap-1 text-sm ${
                    file?.record.published ? "font-semibold" : "font-normal"
                  }`}
                >
                  <Share className="h-4 w-4" /> Sharable
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Anyone with the link can view this
              </p>

              <div className="absolute right-2 flex items-center">
                {file?.record.published && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    exit={{ opacity: 0 }}
                    className="rounded-full bg-foreground p-1"
                  >
                    <Check
                      className="h-3 w-3 text-secondary"
                      fontWeight={"bold"}
                    />
                  </motion.div>
                )}{" "}
              </div>
            </div>
          </div>

          {file?.record.published && (
            <div
              className="flex items-center ml-4 cursor-pointer"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                const fileType = getFileType(
                  (file.data as DigitalDocument).encodingFormat
                );

                if (fileType === "pdf")
                  navigator.clipboard.writeText(
                    `${window.location.origin}/pdf/${file.record.author}/${file.record.id}`
                  );
                else if (fileType === "image")
                  navigator.clipboard.writeText(
                    `${window.location.origin}/image/${file.record.author}/${file.record.id}`
                  );
                else if (fileType === "video")
                  navigator.clipboard.writeText(
                    `${window.location.origin}/video/${file.record.author}/${file.record.id}`
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
                <Check className="w-3 h-3 mr-1" fontWeight={"bold"} />
              ) : (
                <Copy className="w-3 h-3 mr-1" fontWeight={"bold"} />
              )}

              {linkCopied ? (
                <p className="text-sm">Link Copied!</p>
              ) : (
                <p className="text-sm">Copy Link</p>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
