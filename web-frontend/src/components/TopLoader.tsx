import { loadingAtom } from "@/state/loadingAtom";
import { useAtom } from "jotai";
import BarLoader from "react-spinners/BarLoader";

export default function TopLoader() {
  const [loading] = useAtom(loadingAtom);

  return (
    <BarLoader
      className="absolute z-30 top-0 left-0 right-0"
      height={4}
      width={"100%"}
      loading={loading}
      color={"#000"}
    />
  );
}
