"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <motion.input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border-2 border-[#e9d5ff] bg-white px-4 py-2 text-sm transition-all",
          "placeholder:text-gray-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b21a8] focus-visible:ring-offset-2 focus-visible:border-[#6b21a8]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.15 }}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
