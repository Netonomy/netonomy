import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";
import useWeb5Store, { dingerProtocolDefinition } from "./stores/useWeb5Store";

const dingsAtom = atomWithStorage<Ding[]>("dings", []);

export default function useDinger() {
  const web5 = useWeb5Store((state) => state.web5);
  const [dings, setDings] = useAtom(dingsAtom);

  /**
   * This function is used to handle the ding button click.
   * It first checks if the web5Context exists.
   * If it does, it calls the handleDing function.
   */
  async function handleDing(did: string, note?: string) {
    if (!web5) return;

    if (did.length === 0) {
      return;
    }

    let ding: any = { dinger: did };
    if (note) {
      ding.note = note;
    }

    try {
      const { record, status } = await web5.dwn.records.write({
        data: ding,
        message: {
          protocol: dingerProtocolDefinition.protocol,
          protocolPath: "ding",
          schema: "ding",
          recipient: did,
        },
      });

      if (status.code !== 202) {
        console.log("Unable to write to DWN:" + status);
        return;
      }

      const { status: sendStatus } = await record!.send(did);

      if (sendStatus.code !== 202) {
        console.log("Unable to send to target did:" + sendStatus);
        //   dingErrorElement.textContent = `${sendStatus.code} - ${sendStatus.detail}`;
        return;
      }

      console.log("Dinged!");
      console.log(did);
      // dingProgressElement.textContent = `Dinged ${shortenedDid}!`;
    } catch (e) {
      // dingErrorElement.textContent = e.message;
      return;
    }
  }

  /**
   * This function is used to fetch dings from the DWN.
   * It first checks if the web5Context exists.
   * If it does, it queries the DWN for records with the dinger protocol.
   * Converts the records to JSON and adds them to the dings array.
   */
  async function fetchDings() {
    if (!web5) return;

    console.log("Fetching dings...");

    // Fetch the dings
    const { records } = await web5.dwn.records.query({
      message: {
        filter: {
          protocol: dingerProtocolDefinition.protocol,
        },
      },
    });

    if (!records) return;

    let dings: Ding[] = [];

    // Convert the records to JSON
    for (var i = 0; i < records.length; i++) {
      const record = records[i];
      let data = await record.data.json();

      data.date = record.dateCreated;

      dings.push(data);
    }

    // Sort the dings by most recent date
    dings = dings.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Set the dings
    setDings(dings);
  }

  useEffect(() => {
    // fetchDings();
  }, []);

  return { dings, handleDing };
}

type Ding = {
  dinger: string;
  date: string;
  note?: string;
};
