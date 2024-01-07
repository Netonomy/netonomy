import { motion } from "framer-motion";

export function SplashPage() {
  return (
    <div className="h-screen w-screen flex flex-col gap-2 items-center justify-center bg-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        exit={{ opacity: 0 }}
      >
        <img src={"/keyLogoWhite1.png"} height={250} width={250} />
      </motion.div>
    </div>
  );
}
