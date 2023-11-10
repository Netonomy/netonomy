import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileImgSelector from "@/components/ProfileImgSelector";
// import KeyLogo from "@/components/KeyLogo";
import useProfileStore from "@/hooks/stores/useProfileStore";
import useWeb5Store from "@/hooks/stores/useWeb5Store";
import { client } from "@passwordless-id/webauthn";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const profileSchema = z.object({
  name: z.string().min(2).max(50),
});

export default function CreateProfile() {
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const web5 = useWeb5Store((state) => state.web5);
  const did = useWeb5Store((state) => state.did);

  const createProfile = useProfileStore((state) => state.actions.createProfile);

  // 1. Define your form.
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof profileSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    if (file && web5 && did) {
      // Convert file to blob
      const blob = new Blob([file], {
        type: "image/png",
      });

      const record = await web5.dwn.records.create({
        data: blob,
      });

      // Convert banner file to blob
      // let bannerBlob: Blob | undefined;
      // let bannerRecordId: string | undefined;
      // if (bannerImg) {
      //   bannerBlob = new Blob([bannerImg], {
      //     type: "image/png",
      //   });

      //   // Upload banner image
      //   const bannerRecord = await web5Context?.web5?.dwn.records.create({
      //     data: bannerBlob,
      //   });

      //   bannerRecordId = bannerRecord?.record?.id;
      // }

      await createProfile({
        name: values.name,
        "@context": "https://schema.org",
        "@type": "Person",
        image: record?.record?.id,
        // banner: bannerRecordId,
      });

      const isLocalAuth = await client.isLocalAuthenticator();

      // Get challenge from server
      const challengeRes = await axios.post(
        "http://localhost:3000/api/auth/requestChallenge",
        {
          did,
        }
      );
      const challenge = challengeRes.data.challenge;
      console.log(challenge);

      console.log("isLocalAuth", isLocalAuth);
      const registration = await client.register(did, challenge, {
        authenticatorType: "auto",
        userVerification: "required",
        timeout: 60000,
        attestation: false,
        userHandle: uuidv4(),
        debug: false,
      });

      console.log("registration", registration);

      // Send registration to server
      const registerRes = await axios.post(
        "http://localhost:3000/api/auth/verify",
        {
          did,
          registration,
        }
      );

      if (registerRes.status === 200) {
        console.log("registerRes", registerRes);
      }

      // navigate("/");
    }
  }

  useEffect(() => {
    // setShowedCreated(true);
  }, []);

  return (
    <div className="h-screen w-screen flex items-center justify-center ">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full max-w-[335px] h-full flex flex-col items-center"
        >
          <div className="w-full flex items-center flex-col flex-1">
            <div className="mt-[25%] flex flex-col items-center w-full ">
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-4xl text-center font-semibold tracking-tight">
                  Create your digital profile
                </h3>
              </div>

              <div className="flex flex-col items-center gap-2 mt-12">
                {/* <BannerImgSelector file={bannerImg} setFile={setBannerImg} /> */}

                <ProfileImgSelector file={file} setFile={setFile} />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="w-full mb-[20px] min-h-[125px] gap-4 flex flex-col ">
            <Button
              type="button"
              className="w-full"
              variant={"outline"}
              onClick={() => navigate("/")}
            >
              Do this later
            </Button>

            <Button type="submit" className="w-full">
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
