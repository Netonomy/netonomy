import useAppStore from "@/features/app/useAppStore";
import BarLoader from "react-spinners/BarLoader";
import { useTheme } from "./ThemeProvider";

export default function TopLoader() {
  const loading = useAppStore((state) => state.loading);
  const theme = useTheme();

  return (
    <BarLoader
      className="absolute z-50 top-0 left-0 right-0"
      height={4}
      width={"100%"}
      loading={loading}
      color={`${theme === "light" ? "#000" : "#fff"}`}
    />
  );
}
