export default function StoragePreview() {
  return (
    <div className="h-full w-full flex">
      <div className="h-full w-full flex flex-col md:max-w-[450px]">
        <div className="flex w-full px-5 md:px-0">
          <h3 className="text-4xl font-semibold tracking-tight">Storage</h3>
        </div>
      </div>

      <div className="hidden md:flex flex-1 w-full"></div>
    </div>
  );
}
