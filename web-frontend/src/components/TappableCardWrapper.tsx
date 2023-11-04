import { motion } from "framer-motion";

export default function TappableCardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="box h-full flex flex-1 w-full cursor-pointer"
      whileHover={{ scale: 1.02, speed: 4 }}
      whileTap={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 155, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
