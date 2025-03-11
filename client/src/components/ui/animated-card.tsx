import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/use-animations";
import { cn } from "@/lib/utils";

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
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>();

  // Animation variants
  const fadeVariants = {
    hidden: { 
      opacity: 0,
      y: animationDirection === "up" ? 20 : 
         animationDirection === "down" ? -20 : 0,
      x: animationDirection === "left" ? 20 : 
         animationDirection === "right" ? -20 : 0,
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      transition: { 
        duration: 0.5, 
        delay: animationDelay,
        ease: "easeOut"
      }
    }
  };

  const slideVariants = {
    hidden: { 
      x: animationDirection === "left" ? -50 : 
         animationDirection === "right" ? 50 : 0,
      y: animationDirection === "up" ? 50 : 
         animationDirection === "down" ? -50 : 0,
      opacity: 0
    },
    visible: { 
      x: 0, 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        delay: animationDelay
      }
    }
  };

  const scaleVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5, 
        delay: animationDelay,
        ease: "easeOut"
      }
    }
  };

  const tiltVariants = {
    hidden: { 
      opacity: 0,
      rotateX: animationDirection === "up" || animationDirection === "down" ? 15 : 0,
      rotateY: animationDirection === "left" || animationDirection === "right" ? 15 : 0,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      rotateX: 0, 
      rotateY: 0,
      scale: 1,
      transition: { 
        duration: 0.6, 
        delay: animationDelay,
        ease: "easeOut"
      }
    }
  };

  // Hover animation variant
  const hoverVariants = {
    rest: { 
      scale: 1,
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    },
    hover: { 
      scale: 1.02,
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.3, ease: "easeOut" }
    },
  };

  // Select the appropriate variant based on animationType
  let selectedVariant;
  switch (animationType) {
    case "fade":
      selectedVariant = fadeVariants;
      break;
    case "slide":
      selectedVariant = slideVariants;
      break;
    case "scale":
      selectedVariant = scaleVariants;
      break;
    case "tilt":
      selectedVariant = tiltVariants;
      break;
    default:
      selectedVariant = fadeVariants;
  }

  const cardContent = (
    <Card className={cn("relative overflow-hidden", className)}>
      {title || description ? (
        <CardHeader className={headerClassName}>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      ) : null}
      <CardContent className={contentClassName}>{children}</CardContent>
      {footer && <CardFooter className={footerClassName}>{footer}</CardFooter>}
    </Card>
  );

  if (animationType === "none") {
    return <div ref={ref}>{cardContent}</div>;
  }

  if (animationType === "hover") {
    return (
      <motion.div
        initial="rest"
        whileHover="hover"
        variants={hoverVariants}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={selectedVariant}
      style={{ perspective: 1000 }} // For 3D effects like tilt
    >
      {cardContent}
    </motion.div>
  );
}