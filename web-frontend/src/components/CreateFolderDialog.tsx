import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import useCollectionStore from "@/hooks/stores/useCollectionStore";

export function CreateFolderDialog({
  open,
  handleChange,
}: {
  open: boolean;
  handleChange: () => void;
}) {
  const [folderName, setFolderName] = useState("");
  const [sending, setSending] = useState(false);
  const createCollection = useCollectionStore(
    (state) => state.actions.createCollection
  );

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

              await createCollection({
                name: folderName,
              });

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
