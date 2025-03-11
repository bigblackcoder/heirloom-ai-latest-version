// Animation variants for Framer Motion
// These can be applied to any component using the motion components

// Fade in animation with optional direction
export const fadeIn = (direction: "up" | "down" | "left" | "right" | "none" = "none", duration = 0.3) => {
  const directionMap = {
    up: { y: 15 },
    down: { y: -15 },
    left: { x: 15 },
    right: { x: -15 },
    none: {}
  };

  return {
    hidden: {
      opacity: 0,
      ...directionMap[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      ...directionMap[direction],
      transition: {
        duration: duration * 0.8,
        ease: "easeIn",
      },
    },
  };
};

// Scale animation for buttons and interactive elements
export const scaleOnHover = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.03,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.97,
    transition: { duration: 0.1 }
  },
};

// Staggered children animation for lists
export const staggerContainer = (staggerChildren = 0.05, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

// Pulse animation for notifications or emphasis
export const pulseAnimation = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: "loop" as const,
      ease: "easeInOut",
    },
  },
};

// Slide animation for panels and drawers
export const slideAnimation = (direction: "up" | "down" | "left" | "right") => {
  const directionMap = {
    up: { y: "100%" },
    down: { y: "-100%" },
    left: { x: "100%" },
    right: { x: "-100%" },
  };

  return {
    hidden: {
      ...directionMap[direction],
      opacity: 0,
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      ...directionMap[direction],
      opacity: 0,
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 400,
      },
    },
  };
};

// Ripple effect for buttons
export const rippleEffect = {
  tap: {
    scale: 0.97,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    transition: { duration: 0.1 }
  }
};

// Rotation animation
export const rotate = {
  initial: { rotate: 0 },
  animate: { 
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: "linear",
    }
  }
};

// Highlight animation for emphasizing elements
export const highlightAnimation = {
  initial: { backgroundColor: "transparent" },
  animate: {
    backgroundColor: ["transparent", "rgba(30, 60, 13, 0.1)", "transparent"],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
    },
  },
};

// Success animation for checkmarks
export const successAnimation = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { type: "spring", duration: 1, bounce: 0 },
      opacity: { duration: 0.3 },
    },
  },
};