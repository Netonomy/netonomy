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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useContext, useRef, useState } from "react";
import Web5Context from "@/Web5Provider";
import useProfile from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";

const profileSchema = z.object({
  name: z.string().min(2).max(50),
});

export default function CreateProfile() {
  const inputref = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<Blob | null>(null);
  const web5Context = useContext(Web5Context);
  const { createProfile } = useProfile();
  const navigate = useNavigate();

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
    if (file && web5Context) {
      // Convert file to blob
      const blob = new Blob([file], {
        type: "image/png",
      });

      const record = await web5Context?.dwn.records.create({
        data: blob,
      });

      await createProfile({
        name: values.name,
        "@context": "https://schema.org",
        "@type": "Person",
        image: record?.record?.id,
      });

      navigate("/");
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setFile(files[0]);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center ">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full max-w-[335px] h-full flex flex-col items-center justify-between"
        >
          <div className="w-full flex items-center flex-col gap-10">
            <div className="mt-[30%] flex flex-col items-center w-full gap-[75px]">
              <h3 className="scroll-m-20 text-4xl text-center font-semibold tracking-tight">
                Create your digital profile
              </h3>

              <div className="flex flex-col items-center gap-2">
                <Avatar
                  className="h-16 w-16"
                  onClick={() => {
                    inputref?.current?.click();
                  }}
                >
                  <AvatarImage
                    src={file ? URL.createObjectURL(file) : undefined}
                  />
                  <AvatarFallback>
                    <div className="rounded-full h-16 w-16 bg-gray-400 file:text-transparent" />
                  </AvatarFallback>
                </Avatar>

                <input
                  ref={inputref}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                />

                <p className="text-sm text-muted-foreground">
                  Select a profile image.
                </p>
              </div>
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

          <div className="w-full mb-[20px] min-h-[75px]">
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
