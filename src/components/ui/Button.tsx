import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, type HTMLMotionProps } from "framer-motion";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "variant"> {
  variant?: "primary" | "secondary" | "outline";
}

export function Button({
  children,
  className,
  variant = "primary",
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-[#ff99aa] hover:bg-[#ff8095] text-foreground",
    secondary: "bg-[#feface] hover:bg-[#fdf5b3] text-foreground",
    outline: "bg-transparent border-2 border-foreground hover:bg-black/5",
  };

  return (
    <motion.button
      className={cn(
        "px-4 py-2 rounded-lg font-bold border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
        variants[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      whileHover={!disabled ? { scale: 1.02, boxShadow: "4px_4px_0px_0px_rgba(0,0,0,1)" } : {}}
      whileTap={!disabled ? { scale: 0.98, boxShadow: "1px_1px_0px_0px_rgba(0,0,0,1)" } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
