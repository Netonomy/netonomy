import { useContext } from "react";
import "./globals.css";
import { Home } from "./pages/Home";
import Web5Context from "./Web5Provider";
import { Splash } from "./pages/Splash";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AiChatPage from "./pages/AiChatPage";
import CreateProfile from "./pages/CreateProfile";
import PdfViewer from "./pages/PdfViewer";
import WidgetDashboard from "./components/widgets/WidgetDashboard";
import ProfilePage from "./pages/ProfilePage";

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
  const web5Context = useContext(Web5Context);

  return (
    <>{web5Context.web5 ? <RouterProvider router={router} /> : <Splash />}</>
  );
}

export default App;
