import TopLoader from "./TopLoader";

export default function PageContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen flex flex-col relative max-h-[-webkit-fill-available]">
      <TopLoader />

      {children}
    </div>
  );
}
