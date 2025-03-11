import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/use-animations";

interface AnimatedCardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  animationType?: "fade" | "slide" | "scale" | "tilt" | "hover" | "none";
  animationDelay?: number;
  animationDirection?: "up" | "down" | "left" | "right";
}

export function AnimatedCard({
  children,
  title,
  description,
  footer,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  animationType = "fade",
  animationDelay = 0,
  animationDirection = "up",
}: AnimatedCardProps) {
  const [ref, isVisible] = useScrollAnimation();

  // Animation variants
  const variants = {
    fade: {
      hidden: { opacity: 0, y: 10 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.5,
          delay: animationDelay
        }
      }
    },
    slide: {
      hidden: { 
        opacity: 0,
        x: animationDirection === "left" ? -50 : 
           animationDirection === "right" ? 50 : 0,
        y: animationDirection === "up" ? 50 : 
           animationDirection === "down" ? -50 : 0
      },
      visible: { 
        opacity: 1, 
        x: 0, 
        y: 0,
        transition: { 
          type: "spring", 
          damping: 25, 
          stiffness: 500,
          delay: animationDelay
        }
      }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { 
          duration: 0.5,
          delay: animationDelay
        }
      }
    },
    tilt: {
      hidden: { 
        opacity: 0, 
        rotateX: 10, 
        rotateY: 10, 
        y: 20 
      },
      visible: { 
        opacity: 1, 
        rotateX: 0, 
        rotateY: 0, 
        y: 0,
        transition: { 
          duration: 0.6,
          delay: animationDelay
        }
      }
    },
    none: {
      hidden: { opacity: 1 },
      visible: { opacity: 1 }
    }
  };

  // Base component when no animation is needed
  if (animationType === "none") {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader className={headerClassName}>
            {title}
            {description}
          </CardHeader>
        )}
        <CardContent className={contentClassName}>{children}</CardContent>
        {footer && <CardFooter className={footerClassName}>{footer}</CardFooter>}
      </Card>
    );
  }

  // Card with hover animation
  if (animationType === "hover") {
    return (
      <motion.div
        className={cn("h-full", className)}
        whileHover={{ 
          y: -5, 
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" 
        }}
        transition={{ duration: 0.2 }}
      >
        <Card className="h-full transition-all duration-200">
          {(title || description) && (
            <CardHeader className={headerClassName}>
              {title}
              {description}
            </CardHeader>
          )}
          <CardContent className={contentClassName}>{children}</CardContent>
          {footer && <CardFooter className={footerClassName}>{footer}</CardFooter>}
        </Card>
      </motion.div>
    );
  }

  // Animated card with scroll reveal
  return (
    <motion.div
      ref={ref}
      className={cn("h-full", className)}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={variants[animationType]}
    >
      <Card className="h-full">
        {(title || description) && (
          <CardHeader className={headerClassName}>
            {title}
            {description}
          </CardHeader>
        )}
        <CardContent className={contentClassName}>{children}</CardContent>
        {footer && <CardFooter className={footerClassName}>{footer}</CardFooter>}
      </Card>
    </motion.div>
  );
}