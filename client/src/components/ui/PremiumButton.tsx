import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PremiumButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] border-transparent",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[0_0_20px_rgba(112,0,255,0.3)] hover:shadow-[0_0_30px_rgba(112,0,255,0.5)] border-transparent",
      outline: "bg-transparent border border-white/20 text-foreground hover:bg-white/5",
      ghost: "bg-transparent text-foreground hover:bg-white/5 border-transparent",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-12 px-6 text-base font-medium",
      lg: "h-14 px-8 text-lg font-semibold",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(
          "inline-flex items-center justify-center rounded-xl transition-colors duration-300 relative overflow-hidden",
          variants[variant],
          sizes[size],
          (disabled || isLoading) && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Shine effect for primary/secondary */}
        {(variant === "primary" || variant === "secondary") && (
          <span className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[45deg] group-hover:animate-shine" />
        )}
        
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : null}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
    );
  }
);
PremiumButton.displayName = "PremiumButton";
