"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default:
        "bg-[#6b21a8] text-white hover:bg-[#7c3aed] active:scale-[0.98] shadow-lg shadow-purple-500/20",
      outline:
        "border-2 border-[#6b21a8] text-[#6b21a8] hover:bg-[#f5f3ff] active:scale-[0.98]",
      ghost: "text-[#6b21a8] hover:bg-[#f5f3ff] active:scale-[0.98]",
    };

    const sizes = {
      default: "h-11 px-6 text-sm",
      sm: "h-9 px-4 text-sm",
      lg: "h-12 px-8 text-base",
    };

    return (
      <motion.button
        {...(props as any)}
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ duration: 0.15 }}
        {...props}
      >
        {isLoading ? (
          <motion.div
            className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        ) : null}
        {children}
      </motion.button>
    );
  },
);

Button.displayName = "Button";

export { Button };
