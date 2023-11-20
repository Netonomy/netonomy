import useLoadingStore from "@/hooks/stores/useLoadingStore";
import BarLoader from "react-spinners/BarLoader";
import { useTheme } from "./theme-provider";

export default function TopLoader() {
  const loading = useLoadingStore((state) => state.loading);
  const theme = useTheme();

  return (
    <BarLoader
      className="absolute z-30 top-0 left-0 right-0"
      height={4}
      width={"100%"}
      loading={loading}
      color={`${theme === "light" ? "#000" : "#fff"}`}
    />
  );
}
