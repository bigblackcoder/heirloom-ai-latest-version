import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, X, Info, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export type SecurityAlertType = 'warning' | 'critical' | 'info' | 'success';

export interface SecurityAlert {
  id: string;
  type: SecurityAlertType;
  title: string;
  message: string;
  timestamp: Date;
  dismissed?: boolean;
  link?: string;
  linkText?: string;
}

interface SecurityAlertContextType {
  alerts: SecurityAlert[];
  addAlert: (alert: Omit<SecurityAlert, 'id' | 'timestamp'>) => void;
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
}

// Create context
const SecurityAlertContext = React.createContext<SecurityAlertContextType>({
  alerts: [],
  addAlert: () => {},
  dismissAlert: () => {},
  clearAlerts: () => {},
});

// Hook to use the security alert context
export const useSecurityAlert = () => React.useContext(SecurityAlertContext);

// Provider component
export const SecurityAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const { toast } = useToast();

  // Add a new security alert
  const addAlert = (alert: Omit<SecurityAlert, 'id' | 'timestamp'>) => {
    const newAlert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      dismissed: false,
    };
    
    setAlerts((prev) => [newAlert, ...prev]);
    
    // Show toast notification for non-critical alerts
    if (alert.type !== 'critical') {
      toast({
        title: alert.title,
        description: alert.message,
        variant: alert.type === 'warning' ? 'destructive' : 'default',
      });
    }
  };

  // Dismiss an alert by ID
  const dismissAlert = (id: string) => {
    setAlerts((prev) => 
      prev.map((alert) => 
        alert.id === id ? { ...alert, dismissed: true } : alert
      )
    );
  };

  // Clear all alerts
  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <SecurityAlertContext.Provider value={{ alerts, addAlert, dismissAlert, clearAlerts }}>
      {children}
      <SecurityAlertDialogs />
    </SecurityAlertContext.Provider>
  );
};

// Component to display critical security alerts in a dialog
const SecurityAlertDialogs: React.FC = () => {
  const { alerts, dismissAlert } = useSecurityAlert();
  const [currentAlertIndex, setCurrentAlertIndex] = useState<number | null>(null);
  
  // Find the first non-dismissed critical alert
  useEffect(() => {
    const criticalAlertIndex = alerts.findIndex(
      (alert) => alert.type === 'critical' && !alert.dismissed
    );
    
    if (criticalAlertIndex !== -1 && currentAlertIndex === null) {
      setCurrentAlertIndex(criticalAlertIndex);
    } else if (criticalAlertIndex === -1 && currentAlertIndex !== null) {
      setCurrentAlertIndex(null);
    }
  }, [alerts, currentAlertIndex]);
  
  // Handle dialog close
  const handleClose = () => {
    if (currentAlertIndex !== null) {
      dismissAlert(alerts[currentAlertIndex].id);
      setCurrentAlertIndex(null);
    }
  };

  // If no active critical alert, don't render anything
  if (currentAlertIndex === null || !alerts[currentAlertIndex]) {
    return null;
  }

  const currentAlert = alerts[currentAlertIndex];

  return (
    <AlertDialog open={true} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>{currentAlert.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {currentAlert.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {currentAlert.link && (
            <Button
              variant="outline"
              onClick={() => window.open(currentAlert.link, '_blank')}
            >
              {currentAlert.linkText || 'Learn More'}
            </Button>
          )}
          <AlertDialogAction onClick={handleClose}>Acknowledge</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Component to display a list of security alerts
export const SecurityAlertList: React.FC = () => {
  const { alerts, dismissAlert } = useSecurityAlert();
  
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p>No security alerts</p>
      </div>
    );
  }

  // Sort alerts by timestamp, newest first
  const sortedAlerts = [...alerts].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-3 py-2">
      {sortedAlerts.map((alert) => (
        <SecurityAlertItem key={alert.id} alert={alert} onDismiss={dismissAlert} />
      ))}
    </div>
  );
};

// Individual security alert item
const SecurityAlertItem: React.FC<{
  alert: SecurityAlert;
  onDismiss: (id: string) => void;
}> = ({ alert, onDismiss }) => {
  const getIcon = () => {
    switch (alert.type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (alert.type) {
      case 'critical':
        return 'bg-destructive/10 border-destructive/20';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div
      className={`rounded-lg border p-4 ${getBackgroundColor()} ${
        alert.dismissed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="mt-0.5">{getIcon()}</div>
          <div>
            <h4 className="font-medium text-sm">{alert.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
            {alert.link && (
              <a
                href={alert.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                {alert.linkText || 'Learn more'}
              </a>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              {new Date(alert.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
        {!alert.dismissed && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full"
            onClick={() => onDismiss(alert.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};