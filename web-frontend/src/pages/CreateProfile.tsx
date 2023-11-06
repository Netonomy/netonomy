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
import { useContext, useEffect, useRef, useState } from "react";
import Web5Context from "@/Web5Provider";
import useProfile, { showedCreatedProfileAtom } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import BannerImgSelector from "@/components/BannerImgSelector";
import ProfileImgSelector from "@/components/ProfileImgSelector";
import KeyLogo from "@/components/KeyLogo";
import { useAtom } from "jotai";

const profileSchema = z.object({
  name: z.string().min(2).max(50),
});

export default function CreateProfile() {
  const inputref = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const web5Context = useContext(Web5Context);
  const { createProfile } = useProfile();
  const navigate = useNavigate();

  const [, setShowedCreated] = useAtom(showedCreatedProfileAtom);
  const [bannerImg, setBannerImg] = useState<File | null>(null);

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
    if (file && web5Context.web5) {
      // Convert file to blob
      const blob = new Blob([file], {
        type: "image/png",
      });

      const record = await web5Context?.web5?.dwn.records.create({
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

      navigate("/");
    }
  }

  useEffect(() => {
    setShowedCreated(true);
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
              type="submit"
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
