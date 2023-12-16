import { ProfileWidet } from '@renderer/components/widgets/ProfileWidget'
import useProfileStore from '@renderer/hooks/stores/useProfileStore'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ChatScreen from './ChatScreen'
import { StorageWidget } from '@renderer/components/widgets/StorageWidget'
import TopLoader from '@renderer/components/TopLoader'
import Header from '@renderer/components/Header'
import MessagesCard from '@renderer/components/MessagesCard'

export default function HomeScreen() {
  const navigate = useNavigate()
  const profile = useProfileStore((state) => state.profile)
  const fetched = useProfileStore((state) => state.fetched)
  const fetchProfile = useProfileStore((state) => state.fetchProfile)
  const [searchParams] = useSearchParams()
  const messageId = searchParams.get('messageId')

  useEffect(() => {
    fetchProfile()
    if (!profile && fetched) navigate('/create-profile')
  }, [profile, fetched])

  return (
    <>
      <TopLoader />
      <div className={`h-screen w-screen flex flex-col items-center relative `}>
        <Header />
        {/* <DropdownMenu>
        <DropdownMenuTrigger className="absolute top-2 right-14 z-30 rounded-xl ">
          <div className="h-10 w-10 flex items-center justify-center hover:bg-primary-foreground rounded-xl">
            <MoreHorizontal className="w-3 h-3" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-xl">
          <DropdownMenuItem
            className="rounded-xl"
            onClick={() => {
              navigate('/welcome')
            }}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}

        <div className={`h-full w-full flex items-center py-10 px-6 gap-10 relative`}>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-dashboardLg grid-rows-5 w-full h-full">
            <ProfileWidet />
            <StorageWidget />

            <div className="h-full w-full flex flex-col items-center gap-4 row-span-5 col-span-1">
              {messageId ? <ChatScreen /> : <MessagesCard />}
            </div>
            {/* <CredentialsWidget /> */}
            {/* <FinancesWidget /> */}
          </div>
        </div>
      </div>
    </>
  )
}
