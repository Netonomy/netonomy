import useStorageStore, {
  Collection,
  DigitalDocument,
} from "@/stores/useFileStorageStore";
import { Share, Check, Copy, Trash, Lock } from "lucide-react";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { Record } from "@web5/api";
import { useState } from "react";

export default function FileContextMenu({
  children,
  file,
}: {
  children: React.ReactNode;
  file: {
    data: DigitalDocument | Collection;
    record: Record;
  };
}) {
  const updateFile = useStorageStore((state) => state.actions.updateFileItem);
  const deleteItem = useStorageStore((state) => state.actions.deleteItem);
  const [linkCopied, setLinkCopied] = useState(false);

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Share className="w-4 h-4 mr-2 text-inherit" />
            Share
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuCheckboxItem
              checked={!file.record.published}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateFile(
                  (file.data as DigitalDocument).identifier,
                  file.data as DigitalDocument,
                  false
                );
              }}
            >
              <Lock className="w-4 h-4 mr-2 text-inherit" />
              Private
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem
              checked={file.record.published}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateFile(
                  (file.data as DigitalDocument).identifier,
                  file.data as DigitalDocument,
                  true
                );
              }}
            >
              <Share className="w-4 h-4 mr-2 text-inherit" />
              Shareable
            </ContextMenuCheckboxItem>

            {file.record.published && (
              <ContextMenuItem
                inset
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
              </ContextMenuItem>
            )}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem
          onClick={(event) => {
            event.stopPropagation();
            deleteItem((file.data as DigitalDocument).identifier);
          }}
        >
          <Trash className="w-4 h-4 mr-2 text-inherit" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
