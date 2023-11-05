import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CreateProfile from "./pages/CreateProfile.tsx";
import { Providers } from "./Providers.tsx";
import PdfViewer from "./pages/PdfViewer.tsx";
import { ProfileWidet } from "./components/widgets/ProfileWidget.tsx";
import { StorageWidget } from "./components/widgets/StorageWidget.tsx";
import { Chat } from "./components/Chat.tsx";
import CredentialsWidget from "./components/widgets/CredentialsWidget.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
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
    element: (
      <div className="h-screen w-screen p-8">
        <Chat />
      </div>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </React.StrictMode>
);
