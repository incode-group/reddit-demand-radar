"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-[#6b21a8] text-white",
      secondary: "bg-[#f5f3ff] text-[#6b21a8]",
      outline: "border-2 border-[#6b21a8] text-[#6b21a8]",
    };

    return (
      <motion.div
        {...(props as any)}
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
          variants[variant],
          className,
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
        {...props}
      />
    );
  },
);

Badge.displayName = "Badge";

export { Badge };
