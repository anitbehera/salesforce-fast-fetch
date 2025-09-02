"use client";

import { motion, type Variants } from "motion/react";
import "./Initializing.css";

function Initializing() {
  const dotVariants: Variants = {
    jump: {
      y: -30,
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-start h-screen pt-32 text-[var(--vscode-sideBar-foreground)]">
      {/* <p className="mb-6 text-sm pb-2">Initializing...</p> */}

      <motion.div
        animate="jump"
        transition={{ staggerChildren: -0.2, staggerDirection: -1 }}
        className="container"
      >
        <motion.div className="dot" variants={dotVariants} />
        <motion.div className="dot" variants={dotVariants} />
        <motion.div className="dot" variants={dotVariants} />
      </motion.div>
    </div>
  );
}

export default Initializing;
