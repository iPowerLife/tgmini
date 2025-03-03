"use client"

import { motion } from "framer-motion"

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
}

export function PageTransition({ children }) {
  return (
    <motion.div initial="initial" animate="enter" exit="exit" variants={pageVariants}>
      {children}
    </motion.div>
  )
}

