import { useState } from 'react'
import { Card, CardContent, CardHeader } from './ui/card'
import { Input } from './ui/input'
import msgSearchIcon from '@renderer/assets/msgSearchIcon.svg'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import MessageListItem from './MessageListItem'

export default function MessagesCard() {
  const [searchText, setSearchText] = useState('')

  return (
    <Card className="rounded-xl w-full h-full shadow-lg">
      <CardHeader>
        <div className="flex items-center w-full gap-2">
          <div className="relative flex-1">
            <img src={msgSearchIcon} height={22} width={22} className="absolute top-2 left-2" />
            <Input
              placeholder=""
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-[#F1F5F9] pl-10 rounded-xl"
            />
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button size={'sm'} className="rounded-full" variant={'secondary'}>
              <Plus className="w-4 h-4" />
            </Button>
            <small className="text-[8px] font-medium leading-none">New Message</small>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <MessageListItem />
      </CardContent>
    </Card>
  )
}
