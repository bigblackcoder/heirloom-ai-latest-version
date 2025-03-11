import React, { ButtonHTMLAttributes, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRippleEffect } from "@/hooks/use-animations";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  animationType?: "scale" | "pulse" | "ripple" | "bounce" | "shadow" | "none";
  withIcon?: boolean;
  className?: string;
  isLoading?: boolean;
}

export function AnimatedButton({
  children,
  variant = "default",
  size = "default",
  animationType = "scale",
  withIcon = false,
  className,
  isLoading = false,
  ...props
}: AnimatedButtonProps) {
  const [isTapped, setIsTapped] = useState(false);
  const { ripples, addRipple, styles: rippleContainerStyles, rippleStyles } = useRippleEffect();
  
  // Animation variants
  const animationVariants = {
    scale: {
      rest: { scale: 1 },
      hover: { scale: 1.03 },
      tap: { scale: 0.97 },
    },
    pulse: {
      rest: { boxShadow: "0 0 0 0 rgba(30, 60, 13, 0)" },
      hover: { 
        boxShadow: [
          "0 0 0 0 rgba(30, 60, 13, 0.4)",
          "0 0 0 8px rgba(30, 60, 13, 0)",
        ],
        transition: {
          boxShadow: {
            repeat: Infinity,
            duration: 2,
          },
        },
      },
      tap: { scale: 0.97 },
    },
    bounce: {
      rest: { y: 0 },
      hover: { y: -3 },
      tap: { y: 1 },
    },
    shadow: {
      rest: { 
        y: 0,
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" 
      },
      hover: { 
        y: -2,
        boxShadow: "0 5px 10px rgba(0, 0, 0, 0.15)" 
      },
      tap: { 
        y: 0,
        boxShadow: "0 2px 3px rgba(0, 0, 0, 0.1)" 
      },
    },
    none: {},
  };

  // Set animation variant based on type prop
  const currentVariant = animationType !== "ripple" && animationType !== "none" 
    ? animationVariants[animationType] 
    : undefined;

  const handleRippleClick = (e: React.MouseEvent) => {
    if (animationType === "ripple") {
      addRipple(e);
    }
  };
  
  return (
    <motion.div
      className="inline-block"
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      animate={isTapped ? "tap" : "rest"}
      variants={currentVariant}
    >
      <Button
        variant={variant}
        size={size}
        className={cn(
          "relative overflow-hidden",
          animationType === "ripple" && "overflow-hidden",
          className
        )}
        style={animationType === "ripple" ? rippleContainerStyles : undefined}
        onClick={animationType === "ripple" ? handleRippleClick : undefined}
        onMouseDown={() => setIsTapped(true)}
        onMouseUp={() => setIsTapped(false)}
        onMouseLeave={() => setIsTapped(false)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <motion.div 
            className="mr-2" 
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: "linear"
            }}
          >
            <svg 
              className="w-4 h-4" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" fill="none" />
              <path 
                className="opacity-75" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                fill="currentColor" 
              />
            </svg>
          </motion.div>
        )}
        
        {children}
        
        {/* Ripple effect */}
        {animationType === "ripple" && ripples.map(ripple => (
          <span
            key={ripple.id}
            style={rippleStyles(ripple.x, ripple.y)}
          />
        ))}
      </Button>
    </motion.div>
  );
}