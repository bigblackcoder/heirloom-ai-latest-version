import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

// Define the context type
type DeviceContextType = {
  isMobile: boolean;
  isActualMobile: boolean;
  forceMobile: boolean;
  setForceMobile: (force: boolean) => void;
  forceDesktop: boolean;
  setForceDesktop: (force: boolean) => void;
};

// Create the context with default values
const DeviceContext = createContext<DeviceContextType>({
  isMobile: false,
  isActualMobile: false,
  forceMobile: false,
  setForceMobile: () => {},
  forceDesktop: false,
  setForceDesktop: () => {},
});

// Provider component
export function DeviceProvider({ children }: { children: ReactNode }) {
  const isActualMobile = useIsMobile();
  const [forceMobile, setForceMobile] = useState(false);
  const [forceDesktop, setForceDesktop] = useState(false);
  
  // Calculate the effective isMobile state
  const isMobile = forceMobile || (isActualMobile && !forceDesktop);

  // Save preferences to localStorage
  useEffect(() => {
    if (forceMobile) {
      localStorage.setItem('devicePreference', 'mobile');
    } else if (forceDesktop) {
      localStorage.setItem('devicePreference', 'desktop');
    } else {
      localStorage.removeItem('devicePreference');
    }
  }, [forceMobile, forceDesktop]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('devicePreference');
    if (savedPreference === 'mobile') {
      setForceMobile(true);
      setForceDesktop(false);
    } else if (savedPreference === 'desktop') {
      setForceMobile(false);
      setForceDesktop(true);
    }
  }, []);

  return (
    <DeviceContext.Provider
      value={{
        isMobile,
        isActualMobile,
        forceMobile,
        setForceMobile: (force) => {
          setForceMobile(force);
          if (force) setForceDesktop(false);
        },
        forceDesktop,
        setForceDesktop: (force) => {
          setForceDesktop(force);
          if (force) setForceMobile(false);
        },
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

// Custom hook to use the device context
export function useDevice() {
  return useContext(DeviceContext);
}