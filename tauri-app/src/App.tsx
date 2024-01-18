import { RouterProvider, createBrowserRouter } from "react-router-dom";
import useWeb5Store from "./features/app/useWeb5Store";
import React, { Suspense, useEffect } from "react";
import { SplashPage } from "./pages/SplashPage";
import HomePage from "./pages/HomePage";
import { ThemeProvider } from "./components/ThemeProvider";
import Storage from "./features/storage/components/Storage";
import ProfilePage from "./pages/ProfilePage";
import Chat from "./components/messages/chat/Chat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PdfViewer from "./features/storage/components/fileViewers/PdfViewer";
import FileViewerPage from "./pages/FileViewerPage";
import ImageViewer from "./features/storage/components/fileViewers/ImageViewer";
import VideoViwer from "./features/storage/components/fileViewers/VideoViewer";
const MessagesPage = React.lazy(() => import("./pages/MessagesPage"));
const CreateProfilePage = React.lazy(() => import("./pages/CreateProfilePage"));

export const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    children: [
      {
        path: "/",
        element: <Storage />,
      },
      {
        path: "/profile/:did",
        element: <ProfilePage />,
      },
      {
        path: "/ai",
        element: <Chat showBackButton={false} />,
      },
    ],
  },
  {
    path: "/file",
    element: <FileViewerPage />,
    children: [
      {
        path: "pdf/:did/:recordId",
        element: <PdfViewer />,
      },
      {
        path: "image/:did/:recordId",
        element: <ImageViewer />,
      },
      {
        path: "video/:did/:recordId",
        element: <VideoViwer />,
      },
    ],
  },
  {
    path: "/messages",
    element: (
      <Suspense>
        <MessagesPage />
      </Suspense>
    ),
  },
  {
    path: "/create-profile",
    element: (
      <Suspense>
        <CreateProfilePage />
      </Suspense>
    ),
  },
]);

function App() {
  const web5 = useWeb5Store((state) => state.web5);
  const connect = useWeb5Store((state) => state.connect);

  useEffect(() => {
    if (!web5) connect();
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {web5 ? <RouterProvider router={router} /> : <SplashPage />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
