import { Button } from '@renderer/components/ui/button'
import { ProfileWidet } from '@renderer/components/widgets/ProfileWidget'
import { ArrowLeft, CopyCheckIcon, Share } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProfileScreen() {
  const navigate = useNavigate()
  const [linkCopied, setLinkCopied] = useState(false)

  return (
    <div className={`h-screen w-screen flex items-center p-8 gap-10 relative justify-center`}>
      <div className="absolute top-10 left-2 right-0 h-[55px]">
        <Button
          className="w-10 rounded-full p-0"
          variant={'ghost'}
          onClick={() => {
            navigate(-1)
          }}
        >
          <ArrowLeft />
        </Button>
      </div>

      <Button
        className="absolute top-8 right-8"
        size={'sm'}
        onClick={() => {
          // Copy the URL to the clipboard
          navigator.clipboard.writeText(window.location.href)
          setLinkCopied(true)

          // Reset the link copied state
          setTimeout(() => {
            setLinkCopied(false)
          }, 2000)
        }}
      >
        {linkCopied ? (
          <>
            <CopyCheckIcon className="w-4 h-4 mr-2" />
            Copied Link
          </>
        ) : (
          <>
            <Share className="w-4 h-4 mr-2" />
            Share
          </>
        )}
      </Button>

      <div className="w-[425px]">
        <ProfileWidet />
      </div>
    </div>
  )
}
