import React, { ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRippleEffect } from "@/hooks/use-animations";

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
  // For ripple effect
  const { ripples, addRipple, styles, rippleStyles } = useRippleEffect();
  
  // Loading spinner component
  const LoadingSpinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      ></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
  
  // Button content with loading state
  const ButtonContent = () => (
    <>
      {isLoading && <LoadingSpinner />}
      {children}
    </>
  );
  
  // Different animation variants
  switch (animationType) {
    case "scale":
      return (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button 
            variant={variant} 
            size={size}
            className={className}
            disabled={isLoading || props.disabled}
            {...props}
          >
            <ButtonContent />
          </Button>
        </motion.div>
      );
      
    case "pulse":
      return (
        <motion.div
          whileHover={{ 
            boxShadow: "0 0 8px rgba(30, 60, 13, 0.5)",
            transition: { duration: 0.3, repeat: Infinity, repeatType: "reverse" }
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant={variant} 
            size={size}
            className={className}
            disabled={isLoading || props.disabled}
            {...props}
          >
            <ButtonContent />
          </Button>
        </motion.div>
      );
      
    case "bounce":
      return (
        <motion.div
          whileHover={{ y: [0, -6, 0], transition: { repeat: Infinity, duration: 1 } }}
          whileTap={{ scale: 0.9 }}
        >
          <Button 
            variant={variant} 
            size={size}
            className={className}
            disabled={isLoading || props.disabled}
            {...props}
          >
            <ButtonContent />
          </Button>
        </motion.div>
      );
      
    case "shadow":
      return (
        <motion.div
          whileHover={{ 
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            y: -2
          }}
          whileTap={{ boxShadow: "0 0 0 rgba(0, 0, 0, 0)", y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button 
            variant={variant} 
            size={size}
            className={className}
            disabled={isLoading || props.disabled}
            {...props}
          >
            <ButtonContent />
          </Button>
        </motion.div>
      );
      
    case "ripple":
      return (
        <Button 
          variant={variant} 
          size={size}
          className={cn("relative overflow-hidden", className)}
          style={styles}
          disabled={isLoading || props.disabled}
          onClick={(e) => {
            addRipple(e);
            props.onClick?.(e);
          }}
          {...props}
        >
          <ButtonContent />
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              style={{
                ...rippleStyles(ripple.x, ripple.y),
                position: "absolute",
              }}
              className="animate-ripple rounded-full bg-white/30 opacity-0"
            />
          ))}
        </Button>
      );
      
    case "none":
    default:
      return (
        <Button 
          variant={variant} 
          size={size}
          className={className}
          disabled={isLoading || props.disabled}
          {...props}
        >
          <ButtonContent />
        </Button>
      );
  }
}