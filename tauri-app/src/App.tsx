import { RouterProvider, createHashRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MessagesPage from "./pages/MessagesPage";

const router = createHashRouter([
  {
    path: "/",
    element: <HomePage />,
    children: [
      {
        path: "/",
        element: <MessagesPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
