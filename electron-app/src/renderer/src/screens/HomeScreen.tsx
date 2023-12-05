// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger
// } from '@renderer/components/ui/dropdown-menu'
import { ProfileWidet } from '@renderer/components/widgets/ProfileWidget'
import useProfileStore from '@renderer/hooks/stores/useProfileStore'
// import { LogOut, MoreHorizontal } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatScreen from './ChatScreen'
import { StorageWidget } from '@renderer/components/widgets/StorageWidget'
import TopLoader from '@renderer/components/TopLoader'

export default function HomeScreen() {
  const navigate = useNavigate()
  const profile = useProfileStore((state) => state.profile)
  const fetched = useProfileStore((state) => state.fetched)
  const fetchProfile = useProfileStore((state) => state.fetchProfile)

  useEffect(() => {
    fetchProfile()
    if (!profile && fetched) navigate('/create-profile')
  }, [profile, fetched])

  return (
    <>
      <TopLoader />
      <div className={`h-screen w-screen flex flex-col items-center relative `}>
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

        {/* <div className="h-12 bg-black w-full flex items-center pl-8 gap-2">
          <KeyLogo height={35} width={35} />

          <h3 className="scroll-m-20 text-2xl font-semibold text-white tracking-tight">Netonomy</h3>
        </div> */}

        <div className={`h-full w-full flex items-center p-14 gap-10 relative`}>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-dashboardLg grid-rows-5 w-full h-full">
            <ProfileWidet />
            <StorageWidget />
            <ChatScreen />
            {/* <CredentialsWidget /> */}
            {/* <FinancesWidget /> */}
          </div>
        </div>
      </div>
    </>
  )
}
