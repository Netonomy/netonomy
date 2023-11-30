import keyImg from '../assets/keyLogoWhite1.png'

export function SplashScreen() {
  return (
    <div className="h-screen w-screen flex flex-col gap-2 items-center justify-center bg-black">
      <img src={keyImg} height={250} width={250} className="animate-bounce" />
    </div>
  )
}
