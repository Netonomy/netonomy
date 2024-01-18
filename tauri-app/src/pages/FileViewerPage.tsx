import { Outlet, useParams } from "react-router-dom";
import MyRingLoader from "@/components/MyRingLoader";
import PageContainer from "@/components/PageContainer";
import FileViewerHeader from "@/features/storage/components/FileViewerHeader";
import { useFileQuery } from "@/features/storage/hooks";
import useStorageStore from "@/features/storage/store";
import { useEffect } from "react";

export default function FileViewerPage() {
  const { did: didInRoute, recordId } = useParams();
  const fileQuery = useFileQuery(didInRoute!, recordId!);
  const setFileInView = useStorageStore((state) => state.setFileInView);

  useEffect(() => {
    if (fileQuery.data)
      setFileInView({
        blob: fileQuery.data.fileBlob,
        data: fileQuery.data.data,
        record: fileQuery.data.record,
      });

    return () => {
      setFileInView(null);
    };
  }, [fileQuery.isFetching]);

  return (
    <PageContainer>
      <FileViewerHeader />

      <div className="flex flex-1 w-full mt-[55px] items-center justify-center overflow-y-auto">
        <Outlet />

        {fileQuery.isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <MyRingLoader />
          </div>
        )}
        {!fileQuery.data && fileQuery.isFetched && (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-lg font-semibold">File not found</div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
