import useDinger from "@/hooks/useDinger";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export function DingsDialog() {
  const { dings } = useDinger();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="absolute top-0 right-0 bg-red-500 h-8 w-8 rounded-full text-white items-center justify-center flex hover:h-[34px] hover:w-[34px] transition-all cursor-pointer">
          {dings.length}
        </div>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Dinged By:</DialogTitle>
          <DialogDescription>
            Dings are decentralized pings. Kind've like a pager back in the day.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full max-h-[500px] overflow-y-auto flex flex-col items-center">
          {dings.map((ding) => (
            <div className="w-full flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <div className="font-semibold text-lg truncate">
                    {ding.dinger}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {ding.note}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(ding.date).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
