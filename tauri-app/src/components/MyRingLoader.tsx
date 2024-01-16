import { RingLoader } from "react-spinners";
import { useTheme } from "./ThemeProvider";

export default function MyRingLoader() {
  const systemTheme = useTheme();

  return (
    <RingLoader loading color={systemTheme === "dark" ? "#fff" : "#000"} />
  );
}
