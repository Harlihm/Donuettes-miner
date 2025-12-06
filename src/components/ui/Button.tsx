import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-[#ff99aa] hover:bg-[#ff8095] text-foreground",
    secondary: "bg-[#feface] hover:bg-[#fdf5b3] text-foreground",
    outline: "bg-transparent border-2 border-foreground hover:bg-black/5",
  };

  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg font-bold transition-all active:translate-y-[2px] active:shadow-none border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
