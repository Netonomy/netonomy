import { RouterProvider, createHashRouter } from "react-router-dom";
import useWeb5Store from "./stores/useWeb5Store";
import { useEffect } from "react";
import { SplashPage } from "./pages/SplashPage";
import HomePage from "./pages/HomePage";
import PdfViewerPage from "./pages/PdfViewerPage";
import CreateProfilePage from "./pages/CreateProfilePage";
import MessagesPage from "./pages/MessagesPage";

const router = createHashRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/pdf/:recordId",
    element: <PdfViewerPage />,
  },
  {
    path: "/messages",
    element: <MessagesPage />,
  },
  {
    path: "/create-profile",
    element: <CreateProfilePage />,
  },
]);

function App() {
  const web5 = useWeb5Store((state) => state.web5);
  const connect = useWeb5Store((state) => state.connect);

  useEffect(() => {
    if (!web5) connect();
  }, []);

  return <>{web5 ? <RouterProvider router={router} /> : <SplashPage />}</>;
}

export default App;
