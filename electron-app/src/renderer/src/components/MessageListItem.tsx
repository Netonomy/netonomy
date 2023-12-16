import { useSearchParams } from 'react-router-dom'
import { Avatar, AvatarImage } from './ui/avatar'
import aiImg from '@renderer/assets/aiSelf3.png'

export default function MessageListItem() {
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <div
      className="w-full h-16 border-b-2 border-b-secondary flex gap-3 items-center cursor-pointer"
      onClick={() => {
        // Update search params message id
        searchParams.set('messageId', 'ai')
        setSearchParams(searchParams)
      }}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={aiImg} />
      </Avatar>

      <div className="flex-1 flex flex-col justify-start h-full">
        <div className="text-lg font-semibold">AI Assistant</div>
      </div>
    </div>
  )
}
