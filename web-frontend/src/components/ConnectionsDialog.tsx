import useProfileStore from "@/hooks/stores/useProfileStore";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export function ConnectionsDialog({
  open,
  handleChange,
}: {
  open: boolean;
  handleChange: () => void;
}) {
  const connections = useProfileStore((state) => state.profile?.follows);

  return (
    <Dialog open={open} onOpenChange={handleChange}>
      <DialogContent className="sm:max-w-[425px] lg:max-w-[600px] lg:min-h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Connections</DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 flex-col items-center h-full ">
          {(!connections || connections.length === 0) && (
            <div className="h-full w-full items-center justify-center flex flex-1 ">
              <small className="text-sm font-medium leading-none">
                No connections yet
              </small>
            </div>
          )}
        </div>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
