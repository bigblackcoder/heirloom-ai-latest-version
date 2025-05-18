import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import Verification from "@/pages/verification";
import { VerificationOptions } from "@/pages/verification-options";
import Dashboard from "@/pages/dashboard";
import Capsule from "@/pages/capsule";
import Notifications from "@/pages/notifications";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Achievements from "@/pages/achievements";
import Demo from "@/pages/demo";

import OnboardingTips from "@/components/onboarding-tips";
import { useAnalytics } from "@/hooks/use-analytics";
import { initGA, trackEvent } from "@/lib/analytics";
import { SecurityAlertProvider } from "@/components/security-alert";
import { useSecurityMonitoring } from "@/hooks/use-security-monitoring";

function Router() {
  // Use analytics to track page views
  useAnalytics();
  
  // Initialize security monitoring
  useSecurityMonitoring();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/verification" component={Verification} />
      <Route path="/verification-options" component={VerificationOptions} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/capsule" component={Capsule} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/demo" component={Demo} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Get current path for responsive layout
  const path = window.location.pathname;
  const isFullWidthPage = path === '/demo';
  const [location] = useLocation();
  
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
      trackEvent('app_start', 'application', 'initialization');
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SecurityAlertProvider>
          <div className={`min-h-screen bg-background ${isFullWidthPage ? 'w-full' : 'max-w-md mx-auto'} overflow-hidden relative`}>
            <Router />
            <Toaster />
            
            {/* Onboarding tips shown when needed */}
            <OnboardingTips />
          </div>
        </SecurityAlertProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
