import { RingLoader } from "react-spinners";
import { useTheme } from "./ThemeProvider";

export default function MyRingLoader() {
  const systemTheme = useTheme();

  return (
    <RingLoader
      className="absolute z-30 top-0 left-0 right-0 "
      loading
      color={systemTheme === "dark" ? "#fff" : "#000"}
    />
  );
}
