import { Providers } from "./Providers";
import "./globals.css";
import { Home } from "./pages/Home";

function App() {
  return (
    <Providers>
      <Home />
    </Providers>
  );
}

export default App;
