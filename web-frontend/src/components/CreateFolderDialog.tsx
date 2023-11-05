import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import useFolder from "@/hooks/useFiles";

export function CreateFolderDialog({
  open,
  handleChange,
}: {
  open: boolean;
  handleChange: () => void;
}) {
  const { createFolder } = useFolder();
  const [folderName, setFolderName] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <Dialog open={open} onOpenChange={handleChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a Folder</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="folderName"
            placeholder="Folder name"
            disabled={sending}
            className="col-span-3"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={sending}
            onClick={async () => {
              // There must be a DID
              if (!folderName) return;
              setSending(true);

              await createFolder(folderName);

              setSending(false);
              handleChange();

              // Reset the form
              setFolderName("");
            }}
          >
            <>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Save</>
              )}
            </>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
