import { useContext } from "react";
import "./globals.css";
import { Home } from "./pages/Home";
import Web5Context from "./Web5Provider";
import { Splash } from "./pages/Splash";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import CredentialsWidget from "./components/widgets/CredentialsWidget";
import { ProfileWidet } from "./components/widgets/ProfileWidget";
import { StorageWidget } from "./components/widgets/StorageWidget";
import AiChatPage from "./pages/AiChatPage";
import CreateProfile from "./pages/CreateProfile";
import PdfViewer from "./pages/PdfViewer";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    children: [
      {
        path: "/",
        element: (
          <div className="flex flex-1 w-full flex-row items-center h-full gap-10">
            <div className="flex flex-col items-center w-[425px] h-full gap-10">
              <ProfileWidet />
              <CredentialsWidget />
            </div>

            <div className="flex flex-col items-center w-full h-full">
              <StorageWidget />
            </div>
          </div>
        ),
      },
      {
        path: "/pdf/:recordId",
        element: <PdfViewer />,
      },
    ],
  },
  {
    path: "/profile",
    element: <CreateProfile />,
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
