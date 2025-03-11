import { useState, useEffect, useRef, RefObject } from 'react';

// Hook for scroll animations
export function useScrollAnimation(): [RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update our state when observer callback fires
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1, // Trigger when at least 10% of the element is visible
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return [ref, isVisible];
}

// Hook for hover animations
export function useHoverAnimation(): [boolean, {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}] {
  const [isHovered, setIsHovered] = useState(false);
  
  const hoverHandlers = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };
  
  return [isHovered, hoverHandlers];
}

// Hook for tap/click animations
export function useTapAnimation(): [boolean, {
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
}] {
  const [isTapped, setIsTapped] = useState(false);
  
  const tapHandlers = {
    onMouseDown: () => setIsTapped(true),
    onMouseUp: () => setIsTapped(false),
    onMouseLeave: () => setIsTapped(false),
    onTouchStart: () => setIsTapped(true),
    onTouchEnd: () => setIsTapped(false),
  };
  
  return [isTapped, tapHandlers];
}

// Hook for sequential animations
export function useSequentialAnimation(
  totalSteps: number,
  delay = 100
): [number, () => void, () => void] {
  const [currentStep, setCurrentStep] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startAnimation = () => {
    setCurrentStep(0);
    
    const animateNextStep = (step: number) => {
      if (step < totalSteps) {
        timeoutRef.current = setTimeout(() => {
          setCurrentStep(step + 1);
          animateNextStep(step + 1);
        }, delay);
      }
    };
    
    animateNextStep(0);
  };

  const resetAnimation = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCurrentStep(0);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [currentStep, startAnimation, resetAnimation];
}

// Hook for ripple effect on buttons and interactive elements
export function useRippleEffect() {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  let nextId = useRef(0).current;

  const addRipple = (event: React.MouseEvent | React.TouchEvent) => {
    const rippleContainer = event.currentTarget.getBoundingClientRect();
    const size = rippleContainer.width > rippleContainer.height 
      ? rippleContainer.width 
      : rippleContainer.height;
    
    // Get coordinates
    let x, y;
    if ('clientX' in event) {
      // Mouse event
      x = event.clientX - rippleContainer.left - size / 2;
      y = event.clientY - rippleContainer.top - size / 2;
    } else {
      // Touch event
      const touch = event.touches[0];
      x = touch.clientX - rippleContainer.left - size / 2;
      y = touch.clientY - rippleContainer.top - size / 2;
    }
    
    const newRipple = {
      x,
      y,
      id: nextId,
    };
    
    nextId += 1;
    
    setRipples([...ripples, newRipple]);
    
    setTimeout(() => {
      setRipples(prevRipples => prevRipples.filter(ripple => ripple.id !== newRipple.id));
    }, 800); // Match animation duration
  };

  return {
    ripples,
    addRipple,
    styles: {
      position: 'relative' as const,
      overflow: 'hidden' as const,
    },
    rippleStyles: (x: number, y: number) => ({
      position: 'absolute' as const,
      left: x + 'px',
      top: y + 'px',
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      opacity: 0,
      transform: 'scale(0)',
      animation: 'ripple 800ms ease-out',
    }),
  };
}