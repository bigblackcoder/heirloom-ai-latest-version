import React from 'react';
import { 
  Shield, 
  AlertTriangle, 
  RefreshCcw, 
  ShieldCheck,
  Key
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SecurityAlertList, useSecurityAlert } from '@/components/security-alert';
import { Badge } from '@/components/ui/badge';

export function SecuritySettings() {
  const { alerts, addAlert } = useSecurityAlert();
  
  // Count alerts by type
  const criticalAlerts = alerts.filter(a => a.type === 'critical' && !a.dismissed).length;
  const warningAlerts = alerts.filter(a => a.type === 'warning' && !a.dismissed).length;
  const infoAlerts = alerts.filter(a => a.type === 'info' && !a.dismissed).length;
  
  // Calculate security score (just for display)
  const securityScore = Math.max(20, 100 - (criticalAlerts * 20) - (warningAlerts * 5));
  
  // Test function to add a sample security alert
  const addTestAlert = () => {
    addAlert({
      type: 'warning',
      title: 'Test Security Alert',
      message: 'This is a test security alert. You can dismiss it by clicking the X button.',
      link: 'https://owasp.org/www-community/attacks/',
      linkText: 'Learn about security threats'
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">Security Status</h2>
          <p className="text-sm text-muted-foreground">
            View and manage security settings and alerts
          </p>
        </div>
        <Button variant="outline" onClick={addTestAlert} className="flex gap-1">
          <RefreshCcw className="h-4 w-4" />
          Test Alert
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Security Overview</CardTitle>
            <CardDescription>
              Your current security status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className={`relative w-32 h-32 rounded-full flex items-center justify-center
                ${securityScore > 80 ? 'bg-green-100 text-green-700' : 
                  securityScore > 60 ? 'bg-amber-100 text-amber-700' : 
                  'bg-red-100 text-red-700'}`}
              >
                <span className="text-3xl font-bold">{securityScore}</span>
                <ShieldCheck className="absolute -right-2 -top-2 h-8 w-8" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Critical Issues
                </span>
                <Badge variant={criticalAlerts > 0 ? "destructive" : "outline"}>
                  {criticalAlerts}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Warnings
                </span>
                <Badge variant={warningAlerts > 0 ? "default" : "outline"}>
                  {warningAlerts}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Informational
                </span>
                <Badge variant="outline">{infoAlerts}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Security Features</CardTitle>
            <CardDescription>
              Identity protection settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-sm flex items-center gap-1">
                <Key className="h-4 w-4 text-primary" />
                Two-Factor Authentication
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="text-sm flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Identity Theft Protection
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="text-sm flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Suspicious Login Alerts
              </div>
              <Badge variant="outline">Enabled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Security Alerts</h3>
        <Card>
          <CardContent className="pt-6">
            <SecurityAlertList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}