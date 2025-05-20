import { useState, useEffect } from 'react';

export default function RealTimeClock() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    // Update time every second
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Format time as HH:MM
  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  return (
    <div className="text-sm opacity-70">{formattedTime}</div>
  );
}