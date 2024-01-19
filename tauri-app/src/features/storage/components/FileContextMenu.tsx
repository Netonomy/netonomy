import { Share, Check, Copy, Trash, Lock, Pencil } from "lucide-react";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../../../components/ui/context-menu";
import { useState } from "react";
import { getFileType } from "@/lib/utils";
import { MyFile } from "@/types/MyFile";
import { Record } from "@web5/api";
import {
  invalidateFilesQuery,
  useDeleteFileMutation,
  useUpdateFileInfoMutation,
} from "../hooks";
import useAppStore from "@/features/app/useAppStore";

export default function FileContextMenu({
  children,
  file,
  setEditing,
}: {
  children: React.ReactNode;
  file: {
    record: Record;
    data: MyFile;
  };
  setEditing: (editing: boolean) => void;
}) {
  const [linkCopied, setLinkCopied] = useState(false);
  const deleteFileMutation = useDeleteFileMutation();
  const updateFileMutation = useUpdateFileInfoMutation();
  const setLoading = useAppStore((state) => state.actions.setLoading);

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem
          onClick={(event) => {
            event.stopPropagation();
            setEditing(true);
          }}
        >
          <Pencil className="w-4 h-4 mr-2 text-inherit" />
          Edit
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Share className="w-4 h-4 mr-2 text-inherit" />
            Share
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuCheckboxItem
              checked={!file.record?.published}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateFileMutation.mutate({
                  publish: false,
                  record: file.record,
                  newFileInfo: file.data,
                });
              }}
            >
              <Lock className="w-4 h-4 mr-2 text-inherit" />
              Private
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem
              checked={file.record?.published}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                updateFileMutation.mutate({
                  publish: true,
                  record: file.record,
                  newFileInfo: file.data,
                });
              }}
            >
              <Share className="w-4 h-4 mr-2 text-inherit" />
              Shareable
            </ContextMenuCheckboxItem>

            {file.record?.published && (
              <ContextMenuItem
                inset
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  const fileType = getFileType(file.data.type);

                  if (fileType === "pdf")
                    navigator.clipboard.writeText(
                      `${window.location.origin}/file/pdf/${file.record?.author}/${file.record?.id}`
                    );
                  else if (fileType === "image")
                    navigator.clipboard.writeText(
                      `${window.location.origin}/file/image/${file.record?.author}/${file.record?.id}`
                    );
                  else if (fileType === "video")
                    navigator.clipboard.writeText(
                      `${window.location.origin}/file/video/${file.record?.author}/${file.record?.id}`
                    );
                  else
                    navigator.clipboard.writeText(
                      `${import.meta.env.VITE_DWN_URL}/${
                        file.record?.author
                      }/records/${file.data.fileBlobId}`
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

            setLoading(true);
            deleteFileMutation.mutate(file.record.id, {
              onSuccess: () => {
                invalidateFilesQuery();
                setLoading(false);
              },
              onError: () => {
                setLoading(false);
              },
            });
          }}
        >
          <Trash className="w-4 h-4 mr-2 text-red-500" />
          <div className="text-red-500">Delete</div>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
