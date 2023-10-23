import { ReactNode } from "react";
import { Web5Provider } from "./Web5Provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <Web5Provider>{children}</Web5Provider>
    </>
  );
}
