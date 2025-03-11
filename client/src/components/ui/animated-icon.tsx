import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedIconProps {
  icon: React.ReactNode;
  animationType?: 
    | "pulse" 
    | "rotate" 
    | "bounce" 
    | "shake" 
    | "wiggle"
    | "blink"
    | "hover"
    | "none";
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  className?: string;
  onClick?: () => void;
  isAnimating?: boolean;
  repeat?: boolean | number;
  duration?: number;
}

export function AnimatedIcon({
  icon,
  animationType = "none",
  size = "md",
  color,
  className,
  onClick,
  isAnimating = true,
  repeat = Infinity,
  duration = 1.5,
}: AnimatedIconProps) {
  // Size mapping
  const sizeClassName = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  // Animation variants
  const variants = {
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
    },
    rotate: {
      rotate: [0, 360],
    },
    bounce: {
      y: [0, -8, 0],
    },
    shake: {
      x: [0, -5, 5, -5, 5, 0],
    },
    wiggle: {
      rotate: [0, -10, 10, -10, 10, 0],
    },
    blink: {
      opacity: [1, 0.2, 1],
    },
    hover: {
      y: [0, -5, 0],
      transition: {
        y: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut",
        },
      },
    },
    none: {},
  };

  // Transitions
  const getTransition = () => {
    const baseTransition = {
      duration,
      repeat: repeat === true ? Infinity : repeat,
      repeatType: "loop" as const,
      ease: "easeInOut",
    };

    // Customizations for specific animations
    switch (animationType) {
      case "rotate":
        return {
          ...baseTransition,
          ease: "linear",
        };
      case "shake":
        return {
          ...baseTransition,
          duration: 0.5,
        };
      case "wiggle":
        return {
          ...baseTransition,
          duration: 0.8,
        };
      default:
        return baseTransition;
    }
  };

  return (
    <motion.div
      className={cn(
        "inline-flex items-center justify-center text-current",
        sizeClassName[size],
        className
      )}
      style={{
        color: color || "currentColor",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
      animate={isAnimating ? variants[animationType] : "none"}
      transition={getTransition()}
      whileHover={
        animationType === "hover"
          ? {}
          : { scale: onClick ? 1.1 : 1 }
      }
      whileTap={onClick ? { scale: 0.95 } : {}}
    >
      {icon}
    </motion.div>
  );
}