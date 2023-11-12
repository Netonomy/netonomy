import { useEffect } from "react";
import "./globals.css";
import { Home } from "./pages/Home";
import { Splash } from "./pages/Splash";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AiChatPage from "./pages/AiChatPage";
import CreateProfile from "./pages/CreateProfile";
import PdfViewer from "./pages/PdfViewer";
import WidgetDashboard from "./components/widgets/WidgetDashboard";
import ProfilePage from "./pages/ProfilePage";
import useWeb5Store from "./hooks/stores/useWeb5Store";
import WelcomePage from "./pages/WelcomePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    children: [
      {
        path: "/",
        element: <WidgetDashboard />,
      },
      {
        path: "/pdf/:recordId",
        element: <PdfViewer />,
      },
    ],
  },
  {
    path: "/welcome",
    element: <WelcomePage />,
  },
  {
    path: "/create-profile",
    element: <CreateProfile />,
  },
  {
    path: "/profile/:did",
    element: <ProfilePage />,
  },
  {
    path: "/chat",
    element: <AiChatPage />,
  },
]);

function App() {
  const web5 = useWeb5Store((state) => state.web5);
  const connect = useWeb5Store((state) => state.connect);

  useEffect(() => {
    if (!web5) connect();
  }, []);

  return <>{web5 ? <RouterProvider router={router} /> : <Splash />}</>;
}

export default App;
