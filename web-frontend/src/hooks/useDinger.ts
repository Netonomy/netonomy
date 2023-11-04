import Web5Context, { dingerProtocolDefinition } from "@/Web5Provider";
import { useContext } from "react";

export default function useDinger() {
  const web5Context = useContext(Web5Context);

  async function handleDing(did: string, note?: string) {
    if (!web5Context) return;

    if (did.length === 0) {
      return;
    }

    let ding: any = { dinger: did };
    if (note) {
      ding.note = note;
    }

    //   dingProgressElement.textContent = "writing ding to local DWN...";

    try {
      const { record, status } = await web5Context.dwn.records.write({
        data: ding,
        message: {
          protocol: dingerProtocolDefinition.protocol,
          protocolPath: "ding",
          schema: "ding",
          recipient: did,
        },
      });

      if (status.code !== 202) {
        //   dingErrorElement.textContent = `${status.code} - ${status.detail}`;
        return;
      }

      const shortenedDid = did.substr(0, 22);
      // dingProgressElement.textContent = `Ding written locally! Dinging ${shortenedDid}...`;

      const { status: sendStatus } = await record!.send(did);

      if (sendStatus.code !== 202) {
        console.log("Unable to send to target did:" + sendStatus);
        //   dingErrorElement.textContent = `${sendStatus.code} - ${sendStatus.detail}`;
        return;
      }

      // dingProgressElement.textContent = `Dinged ${shortenedDid}!`;
    } catch (e) {
      // dingErrorElement.textContent = e.message;
      return;
    }
  }
}
