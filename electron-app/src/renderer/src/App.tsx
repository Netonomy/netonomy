import { RouterProvider, createHashRouter } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import useWeb5Store from './hooks/stores/useWeb5Store'
import { useEffect } from 'react'
import { SplashScreen } from './screens/SplashScreen'
import CreateProfileScreen from './screens/CreateProfileScreen'

const router = createHashRouter([
  {
    path: '/',
    element: <HomeScreen />
  },
  {
    path: '/create-profile',
    element: <CreateProfileScreen />
  }
])

function App(): JSX.Element {
  const web5 = useWeb5Store((state) => state.web5)
  const connect = useWeb5Store((state) => state.connect)

  useEffect(() => {
    if (!web5) connect()
  }, [])

  return <>{web5 ? <RouterProvider router={router} /> : <SplashScreen />}</>
}

export default App
