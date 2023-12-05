import useProfileStore from '@renderer/hooks/stores/useProfileStore'
import useWeb5Store from '@renderer/hooks/stores/useWeb5Store'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import ProfileImgSelector from '@renderer/components/ProfileImgSelector'

const profileSchema = z.object({
  name: z.string().min(2).max(50)
})

export default function CreateProfileScreen() {
  const [file, setFile] = useState<File | null>(null)
  const navigate = useNavigate()
  const web5 = useWeb5Store((state) => state.web5)
  const did = useWeb5Store((state) => state.did)
  const createProfile = useProfileStore((state) => state.actions.createProfile)

  // 1. Define your form.
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: ''
    }
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof profileSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    if (file && web5 && did) {
      // Create profile
      await createProfile({
        name: values.name,
        profileImg: file
      })

      navigate('/')
    }
  }

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

          <div className="w-full mb-[20px] min-h-[65px] gap-4 flex flex-col ">
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
