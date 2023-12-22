import { RouterProvider, createHashRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MessagesPage from "./pages/MessagesPage";
import CreateProfilePage from "./pages/CreateProfilePage";
import useWeb5Store from "./stores/useWeb5Store";
import { useEffect } from "react";
import { SplashPage } from "./pages/SplashPage";

const router = createHashRouter([
  {
    path: "/",
    element: <HomePage />,
    children: [],
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
