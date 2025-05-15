import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device is a mobile device
 * @returns boolean indicating if the device is mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if user agent string indicates mobile device
    const checkMobile = () => {
      const userAgent = 
        typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
      
      const mobile = Boolean(
        userAgent.match(
          /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        )
      );
      
      // Also consider screen size
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(mobile || isSmallScreen);
    };
    
    // Initial check
    checkMobile();
    
    // Listen for resize events to update if screen size changes
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}