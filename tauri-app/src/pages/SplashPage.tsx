export function SplashPage() {
  return (
    <div className="h-screen w-screen flex flex-col gap-2 items-center justify-center bg-black">
      <img
        src={"/keyLogoWhite1.png"}
        height={250}
        width={250}
        className="animate-bounce"
      />
    </div>
  );
}
