import React, { forwardRef, useState, InputHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { FormControl } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
  animateOnFocus?: boolean;
  animateOnChange?: boolean;
  floatingLabel?: boolean;
  successState?: boolean;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  (
    {
      error = false,
      errorMessage,
      animateOnFocus = true,
      animateOnChange = true,
      floatingLabel = false,
      successState = false,
      className,
      placeholder,
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    // Shake animation for error state
    const shakeAnimation = {
      shake: {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      }
    };

    // Highlight animation for success state
    const successAnimation = {
      success: {
        boxShadow: [
          "0 0 0 0 rgba(30, 60, 13, 0)",
          "0 0 0 3px rgba(30, 60, 13, 0.3)",
          "0 0 0 0 rgba(30, 60, 13, 0)"
        ],
        transition: { duration: 1 }
      }
    };

    // Focus animation
    const focusAnimation = {
      rest: { scale: 1, y: 0 },
      focus: { scale: 1.01, y: -2 }
    };

    // States for animations
    const isShaking = error;
    const isSuccess = successState;
    const isAnimatingFocus = isFocused && animateOnFocus;

    return (
      <div className="relative">
        {floatingLabel && placeholder && (
          <motion.label
            htmlFor={id}
            className={cn(
              "absolute left-3 pointer-events-none transition-all duration-200 text-gray-500",
              {
                "text-xs -top-2 bg-white px-1": isFocused || hasValue,
                "text-base top-2": !isFocused && !hasValue,
                "text-red-500": error,
                "text-[#1e3c0d]": isFocused && !error,
              }
            )}
            style={{ zIndex: 1 }}
            initial={false}
            animate={
              isFocused || hasValue
                ? { y: -12, scale: 0.8 }
                : { y: 0, scale: 1 }
            }
            transition={{ duration: 0.2 }}
          >
            {placeholder}
          </motion.label>
        )}

        <motion.div
          className="relative"
          initial="rest"
          animate={
            isShaking
              ? "shake"
              : isSuccess
              ? "success"
              : isAnimatingFocus
              ? "focus"
              : "rest"
          }
          variants={{
            ...shakeAnimation,
            ...successAnimation,
            ...focusAnimation
          }}
        >
          <FormControl>
            <Input
              ref={ref}
              className={cn(
                "transition-all duration-200",
                error
                  ? "border-red-500 focus:ring-red-300"
                  : successState
                  ? "border-[#1e3c0d]/80 focus:ring-[#1e3c0d]/30"
                  : "focus:ring-[#1e3c0d]/30 focus:border-[#1e3c0d]/80",
                floatingLabel && "pt-4",
                className
              )}
              placeholder={floatingLabel ? undefined : placeholder}
              id={id}
              {...props}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
            />
          </FormControl>
          
          {/* Success indicator */}
          {successState && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#1e3c0d]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path 
                  d="M5 8L7 10L11 6" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          )}
        </motion.div>

        {/* Error message */}
        {error && errorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-500 text-sm mt-1"
          >
            {errorMessage}
          </motion.p>
        )}
      </div>
    );
  }
);