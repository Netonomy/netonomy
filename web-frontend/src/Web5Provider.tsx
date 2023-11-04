import { Web5 } from "@web5/api/browser";
import React, { useEffect, useState } from "react";

// Create Web5 context
const Web5Context = React.createContext<Web5 | null>(null as any);

// Create Web5 provider
export function Web5Provider({ children }: any) {
  const [web5, setWeb5] = useState<Web5 | null>(null);
  const [did, setDid] = useState<string | null>(null);

  async function configureProtocol() {
    if (!web5) return;
    const { protocols, status } = await web5.dwn.protocols.query({
      message: {
        filter: {
          protocol: "https://dinger.app/protocol",
        },
      },
    });

    if (status.code !== 200) {
      alert("Failed to query protocols. check console");
      console.error("Failed to query protocols", status);

      return;
    }

    // protocol already exists
    if (protocols.length > 0) {
      console.log("protocol already exists");
    }

    // configure protocol on local DWN
    const { status: configureStatus, protocol } =
      await web5.dwn.protocols.configure({
        message: {
          definition: dingerProtocolDefinition,
        },
      });
    console.log("configure protocol local status", configureStatus);

    // configure protocol on remote DWN, because sync may not have occured yet
    const { status: remoteConfigureStatus } = await protocol!.send(did!);
    console.log("configure protocol remote status", remoteConfigureStatus);
  }

  async function connect() {
    const { web5, did } = await Web5.connect({
      techPreview: {
        // dwnEndpoints: [],
      },
    });
    setWeb5(web5);
    setDid(did);

    // Configure protocol
    configureProtocol();
  }

  useEffect(() => {
    connect();
  }, []);

  return <Web5Context.Provider value={web5}>{children}</Web5Context.Provider>;
}

export default Web5Context;

export const dingerProtocolDefinition = {
  protocol: "https://dinger.app/protocol",
  published: true,
  types: {
    ding: {
      schema: "ding",
      dataFormats: ["application/json"],
    },
  },
  structure: {
    ding: {
      $actions: [
        {
          who: "anyone",
          can: "write",
        },
        {
          who: "author",
          of: "ding",
          can: "read",
        },
        {
          who: "recipient",
          of: "ding",
          can: "read",
        },
      ],
    },
  },
};
