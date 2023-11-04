import { ReactNode } from "react";
import { Web5Provider } from "./Web5Provider";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <Web5Provider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          {children}
        </ThemeProvider>
      </Web5Provider>
    </>
  );
}
