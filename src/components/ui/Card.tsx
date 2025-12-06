import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-secondary-bg rounded-xl border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
