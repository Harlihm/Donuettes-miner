import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, type HTMLMotionProps } from "framer-motion";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  delay?: number;
}

export function Card({ children, className, delay = 0, ...props }: CardProps) {
  return (
    <motion.div
      className={cn(
        "bg-secondary-bg rounded-xl border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.01, boxShadow: "6px_6px_0px_0px_rgba(0,0,0,1)" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
