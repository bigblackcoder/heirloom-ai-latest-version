import { useEffect } from 'react';
import { useSecurityAlert } from '@/components/security-alert';

// This hook can be used to monitor security-related aspects of the application
export function useSecurityMonitoring() {
  const { addAlert } = useSecurityAlert();

  // Monitor for known security fixes and show alerts
  useEffect(() => {
    // Check if we need to show shell execution vulnerability fix alert
    if (!localStorage.getItem('security-alert-shell-execution-fix')) {
      addAlert({
        type: 'success',
        title: 'Security Vulnerability Fixed',
        message: 'A potential shell execution vulnerability in the face verification service has been addressed by using safer process spawning methods. Your data is now better protected.',
        link: 'https://owasp.org/www-community/attacks/Command_Injection',
        linkText: 'Learn about command injection'
      });
      
      // Mark this alert as shown
      localStorage.setItem('security-alert-shell-execution-fix', 'true');
    }
  }, [addAlert]);

  return null;
}

// Export a function that can be used to manually trigger security alerts
export function triggerSecurityAlert(alertData: {
  type: 'warning' | 'critical' | 'info' | 'success';
  title: string;
  message: string;
  link?: string;
  linkText?: string;
}) {
  // Get the addAlert function from the context
  const { addAlert } = useSecurityAlert();
  
  // Add the alert
  addAlert(alertData);
}