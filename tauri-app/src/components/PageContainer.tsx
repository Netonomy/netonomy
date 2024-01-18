import { cn } from "@/lib/utils";
import TopLoader from "./TopLoader";

export default function PageContainer({
  children,
  classname,
}: {
  children: React.ReactNode;
  classname?: string;
}) {
  return (
    <div
      className={cn(
        "h-screen w-screen flex flex-col relative max-h-[-webkit-fill-available] overflow-hidden",
        classname
      )}
    >
      <TopLoader />

      {children}
    </div>
  );
}
