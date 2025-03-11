import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-animations";

interface AnimatedTextProps {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements; // 'h1', 'h2', 'p', etc.
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
  animationType = "fade",
  delay = 0,
  duration = 0.5,
  highlightColor = "rgba(30, 60, 13, 0.2)",
  staggerChildren = 0.05,
}: AnimatedTextProps) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>();

  // Split the text into words and/or letters depending on the animation type
  const words = text.split(" ");
  
  // Handle different types of animations
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { 
        staggerChildren: staggerChildren, 
        delayChildren: delay,
        ease: "easeOut",
        duration: duration,
      }
    })
  };

  const childWordAnimation = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        ease: "easeOut",
        duration: duration,
      }
    }
  };

  const childLetterAnimation = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        ease: "easeOut",
        duration: duration * 0.8,
      }
    }
  };

  const typewriterAnimation = {
    hidden: { width: 0, opacity: 0 },
    visible: {
      width: "100%",
      opacity: 1,
      transition: {
        duration: Math.max(0.5, Math.min(text.length * 0.05, 3)), // Scale with text length, cap at 3s
        delay,
        ease: "linear",
      }
    }
  };

  const highlightAnimation = {
    hidden: { 
      color: "currentColor",
      backgroundPosition: "0% 100%",
      backgroundSize: "0% 30%",
    },
    visible: {
      color: "currentColor",
      backgroundPosition: "0% 100%",
      backgroundSize: "100% 30%",
      transition: {
        duration: 0.8,
        delay,
        ease: "easeOut",
      }
    }
  };

  if (animationType === "none") {
    return <Component className={className}>{text}</Component>;
  }

  if (animationType === "fade") {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration, delay, ease: "easeOut" }}
      >
        <Component className={className}>{text}</Component>
      </motion.div>
    );
  }

  if (animationType === "typewriter") {
    return (
      <div ref={ref} className="inline-block">
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={typewriterAnimation}
          style={{
            overflow: "hidden", 
            whiteSpace: "nowrap",
            display: "inline-block",
          }}
        >
          <Component className={className}>{text}</Component>
        </motion.div>
      </div>
    );
  }

  if (animationType === "highlight") {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={highlightAnimation}
        style={{
          display: "inline-block",
          backgroundImage: `linear-gradient(${highlightColor}, ${highlightColor})`,
          backgroundRepeat: "no-repeat",
        }}
      >
        <Component className={className}>{text}</Component>
      </motion.div>
    );
  }

  if (animationType === "letterByLetter") {
    return (
      <motion.div
        ref={ref}
        style={{ overflow: "hidden" }}
        variants={containerAnimation}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        <Component className={cn("flex flex-wrap", className)}>
          {Array.from(text).map((letter, index) => (
            <motion.span
              key={index}
              variants={childLetterAnimation}
              style={{ display: "inline-block" }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </Component>
      </motion.div>
    );
  }

  // Default to wordByWord animation
  return (
    <motion.div
      ref={ref}
      style={{ overflow: "hidden" }}
      variants={containerAnimation}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      <Component className={cn("flex flex-wrap", className)}>
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={childWordAnimation}
            style={{ display: "inline-block", marginRight: "0.25em" }}
          >
            {word}
          </motion.span>
        ))}
      </Component>
    </motion.div>
  );
}