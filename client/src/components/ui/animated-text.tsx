import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  as?: React.ElementType;
  animationType?: "fade" | "letterByLetter" | "wordByWord" | "highlight" | "typewriter" | "none";
  delay?: number;
  duration?: number;
  highlightColor?: string;
  staggerChildren?: number;
}

export function AnimatedText({
  text,
  className,
  as: Component = "p",
  animationType = "none",
  delay = 0,
  duration = 0.5,
  highlightColor = "rgba(30, 60, 13, 0.2)",
  staggerChildren = 0.03,
}: AnimatedTextProps) {
  // Split text into words and letters for different animation types
  const words = text.split(" ");
  const letters = text.split("");

  // Base animation configuration
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { 
        staggerChildren: staggerChildren, 
        delayChildren: delay * i 
      }
    })
  };

  // Different animation types
  switch (animationType) {
    case "letterByLetter":
      return (
        <motion.div
          className={cn("inline-block", className)}
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: duration
                  }
                }
              }}
              className="inline-block"
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.div>
      );

    case "wordByWord":
      return (
        <motion.div
          className={cn("inline-block", className)}
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {words.map((word, index) => (
            <motion.span
              key={index}
              className="inline-block mr-[0.25em]"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: duration,
                    ease: "easeOut"
                  }
                }
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      );

    case "highlight":
      return (
        <Component className={cn("relative inline-block", className)}>
          <span>{text}</span>
          <motion.span
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: duration, delay: delay }}
            style={{
              position: "absolute",
              height: "0.4em",
              bottom: "0.1em",
              left: 0,
              backgroundColor: highlightColor,
              zIndex: -1,
              borderRadius: "2px",
            }}
          ></motion.span>
        </Component>
      );

    case "typewriter":
      return (
        <Component className={cn(className)}>
          <motion.span
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: duration * text.length * 0.1, 
              delay,
              ease: "linear" 
            }}
            className="inline-block whitespace-nowrap overflow-hidden"
          >
            {text}
          </motion.span>
          <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ 
              duration: 0.5, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }}
            className="inline-block ml-1 w-[2px] h-[1em] bg-current align-text-bottom"
          ></motion.span>
        </Component>
      );

    case "fade":
      const MotionComponent = motion.div;
      return (
        <MotionComponent
          className={cn(className)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, delay }}
        >
          {React.createElement(Component, {}, text)}
        </MotionComponent>
      );

    case "none":
    default:
      return <Component className={className}>{text}</Component>;
  }
}