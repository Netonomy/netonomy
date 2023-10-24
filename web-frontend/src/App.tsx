import { useContext } from "react";
import "./globals.css";
import { Home } from "./pages/Home";
import Web5Context from "./Web5Provider";
import { Splash } from "./pages/Splash";

function App() {
  const web5Context = useContext(Web5Context);

  return web5Context ? <Home /> : <Splash />;
}

export default App;
