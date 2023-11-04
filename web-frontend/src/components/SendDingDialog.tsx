import useDinger from "@/hooks/useDinger";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { Loader2, SendIcon, TowerControl } from "lucide-react";

export function SendDingDialog() {
  const { handleDing } = useDinger();
  const [did, setDid] = useState("");
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = () => setOpen(!open);

  return (
    <Dialog open={open} onOpenChange={handleChange}>
      <DialogTrigger asChild>
        <Button onClick={handleChange} className="gap-2">
          <SendIcon className="h-4 w-4" /> Send a Ding
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send a Ding</DialogTitle>
          <DialogDescription>
            Enter someones DID and write a note
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              DID
            </Label>
            <Input
              id="did"
              disabled={sending}
              className="col-span-3"
              value={did}
              onChange={(e) => setDid(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note" className="text-right">
              note
            </Label>
            <Input
              disabled={sending}
              id="note"
              className="col-span-3"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={sending}
            onClick={async () => {
              // There must be a DID
              if (!did) return;
              setSending(true);

              await handleDing(did, note);

              setSending(false);
              handleChange();

              // Reset the form
              setDid("");
              setNote("");
            }}
          >
            <>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Send</>
              )}
            </>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
