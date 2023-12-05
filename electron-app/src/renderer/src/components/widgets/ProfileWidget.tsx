import useProfileStore from '@renderer/hooks/stores/useProfileStore'
import useWeb5Store from '@renderer/hooks/stores/useWeb5Store'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Pencil, X } from 'lucide-react'

export function ProfileWidet() {
  const navigate = useNavigate()
  const { did } = useParams()
  const profile = useProfileStore((state) => state.profile)
  const profileFetched = useProfileStore((state) => state.fetched)
  const fetchProfile = useProfileStore((state) => state.fetchProfile)
  const usersDid = useWeb5Store((state) => state.did)
  const connections = useProfileStore((state) => state.profile?.follows)
  const [copied, setCopied] = useState(false)
  const [editng, setEditing] = useState(false)
  const [showConnectionsDialog, setShowConenctionsDialog] = useState(false)
  const [shouldNavigate, setShouldNavigate] = useState(true)
  const isOwnersProfile = useProfileStore((state) => state.actions.isOwnerProfile)
  const createConnection = useProfileStore((state) => state.actions.createConnection)
  const [creatingConnection, setCreatingConnection] = useState(false)

  const handleCardClick = () => {
    if (shouldNavigate) {
      // navigate(`/profile/${usersDid}`)
    }
  }

  const handleConnectionsClick = (e: any) => {
    e.stopPropagation()
    e.preventDefault()
    setShouldNavigate(false)
    setShowConenctionsDialog(true)
  }

  const handleCloseDialog = () => {
    setShowConenctionsDialog(false)
    setTimeout(() => {
      setShouldNavigate(true)
    }, 1500)
  }

  useEffect(() => {
    if (!profileFetched) {
      fetchProfile(did || undefined)
    }
  }, [])

  return (
    <div className="row-span-2 col-span-1 w-full flex items-center justify-center relative">
      <Card className="h-full w-full rounded-xl shadow-lg" onClick={handleCardClick}>
        <CardContent className="flex h-full items-center justify-center gap-4 lg:flex-col p-4 relative">
          {/* {!editng ? (
            <div
              className="absolute top-4 right-4"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()

                setEditing(true)
              }}
            >
              <Pencil className="w-5 h-5" />
            </div>
          ) : (
            <div
              className="absolute top-4 right-4"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()

                setEditing(false)
              }}
            >
              <X className="w-5 h-5" />
            </div>
          )} */}

          {!editng ? (
            <>
              <div className="h-12 w-12 lg:h-44 lg:w-44 relative">
                <Avatar className="h-full w-full">
                  {profileFetched ? (
                    <img src={profile?.image} className="h-full w-full" />
                  ) : (
                    // <>{profile?.image && <AvatarImage src={profile.image} />}</>
                    <Skeleton className="h-full w-full" />
                  )}
                  {/* <AvatarFallback>
              {profile?.name?.split(" ")[0]?.charAt(0)}
              {profile?.name?.split(" ")[1]?.charAt(0)}
            </AvatarFallback> */}
                </Avatar>
              </div>

              {profileFetched && profile ? (
                <div className="flex gap-2">
                  {/* <div className="font-light text-[31px]">Hello </div> */}
                  <div className="font-semibold text-[31px]">{profile.name}</div>
                </div>
              ) : (
                <Skeleton className="h-6 w-[150px]" />
              )}
            </>
          ) : (
            <>{/* <EditingProfileForm /> */}</>
          )}

          {/* {usersDid ? (
            <div className="flex items-center gap-2">
              🔑
              <p className="text-sm text-muted-foreground max-w-[250px] truncate">
                Digital Identifier (DID)
              </p>
              {copied ? (
                <CheckCircle className="h-4 w-4 cursor-pointer text-green-600" />
              ) : (
                <CopyIcon
                  className="h-4 w-4 cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();

                    if (usersDid) {
                      navigator.clipboard.writeText(usersDid).then(() => {
                        setCopied(true);

                        setTimeout(() => setCopied(false), 3000);
                      });
                    }
                  }}
                />
              )}
            </div>
          ) : (
            <Skeleton className="h-6 w-[150px]" />
          )} */}

          {isOwnersProfile(did || '') ? (
            <Button variant={'ghost'} size={'sm'} onClick={handleConnectionsClick}>
              <p className="text-sm text-muted-foreground">
                {connections?.length || 0} Connections
              </p>
            </Button>
          ) : (
            <Button
              disabled={creatingConnection}
              onClick={async (e) => {
                e.stopPropagation()
                e.preventDefault()

                setCreatingConnection(true)
                if (did) await createConnection(did)
                setCreatingConnection(false)
              }}
            >
              Follow
            </Button>
          )}

          {/* <ConnectionsDialog open={showConnectionsDialog} handleChange={handleCloseDialog} /> */}
        </CardContent>
      </Card>
    </div>
  )
}
