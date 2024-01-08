import { RouterProvider, createHashRouter } from "react-router-dom";
import useWeb5Store from "./stores/useWeb5Store";
import React, { Suspense, useEffect } from "react";
import { SplashPage } from "./pages/SplashPage";
import HomePage from "./pages/HomePage";
import { ThemeProvider } from "./components/ThemeProvider";
import ImageViewerPage from "./pages/ImageViewerPage";
const PdfViewerPage = React.lazy(() => import("./pages/PdfViewerPage"));
const MessagesPage = React.lazy(() => import("./pages/MessagesPage"));
const CreateProfilePage = React.lazy(() => import("./pages/CreateProfilePage"));
const VideoViewerPage = React.lazy(() => import("./pages/VideoViewerPage"));

const router = createHashRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/pdf/:recordId",
    element: (
      <Suspense>
        <PdfViewerPage />
      </Suspense>
    ),
  },
  {
    path: "/image/:recordId",
    element: (
      <Suspense>
        <ImageViewerPage />
      </Suspense>
    ),
  },
  {
    path: "/video/:recordId",
    element: (
      <Suspense>
        <VideoViewerPage />
      </Suspense>
    ),
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
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      {web5 ? <RouterProvider router={router} /> : <SplashPage />}
    </ThemeProvider>
  );
}

export default App;
