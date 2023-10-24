import { Web5 } from "@web5/api/browser";
import React, { useEffect, useState } from "react";

// Create Web5 context
const Web5Context = React.createContext<Web5 | null>(null as any);

// Create Web5 provider
export function Web5Provider({ children }: any) {
  const [web5, setWeb5] = useState<Web5 | null>(null);

  async function connect() {
    const { web5 } = await Web5.connect({
      techPreview: {
        dwnEndpoints: [],
      },
    });
    setWeb5(web5);
  }

  useEffect(() => {
    connect();
  }, []);

  return <Web5Context.Provider value={web5}>{children}</Web5Context.Provider>;
}

export default Web5Context;
