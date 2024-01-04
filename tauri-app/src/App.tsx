import { RouterProvider, createHashRouter } from "react-router-dom";
import useWeb5Store from "./stores/useWeb5Store";
import React, { Suspense, useEffect } from "react";
import { SplashPage } from "./pages/SplashPage";
import HomePage from "./pages/HomePage";
import { ThemeProvider } from "./components/ThemeProvider";
const PdfViewerPage = React.lazy(() => import("./pages/PdfViewerPage"));
const MessagesPage = React.lazy(() => import("./pages/MessagesPage"));
const CreateProfilePage = React.lazy(() => import("./pages/CreateProfilePage"));

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
      {web5 ? <RouterProvider router={router} /> : <SplashPage />}
    </ThemeProvider>
  );
}

export default App;
