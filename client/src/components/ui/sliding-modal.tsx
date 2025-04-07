import React, { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SlideDirection = "bottom" | "left" | "right";

export interface SlidingModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  direction?: SlideDirection;
  showCloseButton?: boolean;
  showHandle?: boolean;
  width?: string;
  height?: string;
  className?: string;
  overlayClassName?: string;
  containerClassName?: string;
  duration?: number;
  closeOnOverlayClick?: boolean;
}

export function SlidingModal({
  isOpen,
  onClose,
  children,
  direction = "bottom",
  showCloseButton = true,
  showHandle = true,
  width = "100%",
  height = "auto",
  className = "",
  overlayClassName = "",
  containerClassName = "",
  duration = 500,
  closeOnOverlayClick = true,
}: SlidingModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Handle outside clicks and touch events
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && contentRef.current && !contentRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  // Handle animation timing
  useEffect(() => {
    if (isOpen) {
      // Add a small delay to ensure the component is mounted before animating
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Handle close action with animation
  const handleClose = () => {
    setIsExiting(true);
    
    setTimeout(() => {
      setIsExiting(false);
      onClose();
    }, duration);
  };

  // Don't render anything if not open
  if (!isOpen) {
    return null;
  }

  // Determine transform styles based on direction
  const getTransformStyle = () => {
    if (isVisible && !isExiting) {
      return "translate(0, 0)";
    }
    
    switch (direction) {
      case "bottom":
        return "translate(0, 100%)";
      case "left":
        return "translate(-100%, 0)";
      case "right":
        return "translate(100%, 0)";
      default:
        return "translate(0, 100%)";
    }
  };

  // Determine position styles based on direction
  const getPositionStyle = () => {
    switch (direction) {
      case "bottom":
        return { bottom: 0, left: 0, right: 0 };
      case "left":
        return { top: 0, bottom: 0, left: 0 };
      case "right":
        return { top: 0, bottom: 0, right: 0 };
      default:
        return { bottom: 0, left: 0, right: 0 };
    }
  };

  // Base style for modal content
  const modalStyle = {
    transform: getTransformStyle(),
    transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
    width: direction === "bottom" ? "100%" : width,
    height: direction === "bottom" ? "auto" : height,
    ...getPositionStyle(),
  };

  // Class names for different elements
  const overlayClasses = cn(
    "fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-500",
    isVisible && !isExiting ? "opacity-100" : "opacity-0",
    overlayClassName
  );

  const containerClasses = cn(
    "fixed z-50 overflow-hidden",
    direction === "bottom" ? "rounded-t-3xl" : "rounded-xl",
    containerClassName
  );

  const contentClasses = cn(
    "bg-white shadow-lg",
    direction === "bottom" ? "pb-safe" : "",
    isVisible && !isExiting ? "opacity-100" : "opacity-0",
    className
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className={overlayClasses}
        onClick={handleOverlayClick}
      />
      
      {/* Modal container */}
      <div 
        className={containerClasses}
        style={modalStyle}
        ref={contentRef}
      >
        <div className={contentClasses}>
          {/* Handle indicator for bottom sheets */}
          {showHandle && direction === "bottom" && (
            <div className="w-full flex justify-center py-2.5">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
          )}
          
          {/* Close button */}
          {showCloseButton && (
            <button
              className="absolute right-4 top-4 p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors z-10"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          )}
          
          {/* Content */}
          <div className="relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}