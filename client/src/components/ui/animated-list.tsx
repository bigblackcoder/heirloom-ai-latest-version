import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-animations";

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  as?: "ul" | "ol" | "div";
  itemAs?: "li" | "div";
  animationType?: "fade" | "slide" | "scale" | "none";
  staggerDelay?: number;
  animationDuration?: number;
  animationDirection?: "up" | "down" | "left" | "right";
  delayInitial?: number;
}

export function AnimatedList({
  children,
  className,
  itemClassName,
  as: Component = "ul",
  itemAs: ItemComponent = "li",
  animationType = "fade",
  staggerDelay = 0.1,
  animationDuration = 0.5,
  animationDirection = "up",
  delayInitial = 0,
}: AnimatedListProps) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>();
  
  // Get React children as array
  const childrenArray = React.Children.toArray(children);
  
  // Container variants
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: staggerDelay,
        delayChildren: delayInitial,
      }
    }
  };
  
  // Item variants based on animation type
  const itemVariants = {
    fade: {
      hidden: { opacity: 0, y: 10 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: animationDuration }
      }
    },
    slide: {
      hidden: { 
        opacity: 0,
        x: animationDirection === "left" ? -20 : 
           animationDirection === "right" ? 20 : 0,
        y: animationDirection === "up" ? 20 : 
           animationDirection === "down" ? -20 : 0
      },
      visible: { 
        opacity: 1, 
        x: 0, 
        y: 0,
        transition: { 
          type: "spring", 
          damping: 15, 
          stiffness: 300,
          duration: animationDuration
        }
      }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: animationDuration }
      }
    },
    none: {
      hidden: { opacity: 1 },
      visible: { opacity: 1 }
    }
  };
  
  const selectedVariant = itemVariants[animationType];
  
  if (animationType === "none") {
    return (
      <Component className={className}>
        {childrenArray.map((child, index) => (
          <ItemComponent key={index} className={itemClassName}>
            {child}
          </ItemComponent>
        ))}
      </Component>
    );
  }
  
  return (
    <motion.div
      ref={ref}
      className="overflow-hidden"
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <Component className={className}>
        {childrenArray.map((child, index) => (
          <motion.div
            key={index}
            variants={selectedVariant}
            custom={index}
          >
            <ItemComponent className={itemClassName}>
              {child}
            </ItemComponent>
          </motion.div>
        ))}
      </Component>
    </motion.div>
  );
}