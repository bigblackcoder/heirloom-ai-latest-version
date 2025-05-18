import React, { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import UI components
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

// Import pages
import HomePage from './pages/HomePage';
import AuthenticationPage from './pages/AuthenticationPage';
import WebAuthnTest from './pages/WebAuthnTest';
import FaceIDTest from './pages/FaceIDTest';
import DataOwnershipPage from './pages/DataOwnershipPage';
import AIPermissionsPage from './pages/AIPermissionsPage';
import NotificationsPage from './pages/notifications';
import SettingsPage from './pages/settings';
import ProfilePage from './pages/profile';
import VerificationPage from './pages/verification';
import Dashboard from './pages/dashboard';
import VerificationOptionsPage from './pages/verification-options';
import CapsulePage from './pages/capsule';
import Home from './pages/Home';

// Import providers and hooks
import { AuthProvider } from './providers/auth-provider';

// Import styles
import './index.css';

// Create a new QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Not Found Page Component
const NotFoundPage = () => {
  const [, setLocation] = useLocation();
  
  return (
    <div className="not-found-page h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="container max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">404</h1>
        <p className="text-xl mb-8 text-gray-600">Page not found</p>
        <Button onClick={() => setLocation('/')}>Go Home</Button>
      </div>
    </div>
  );
};

function App() {
  // Set up authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = () => {
      // Check for authentication token
      const userToken = localStorage.getItem('userToken');
      setIsAuthenticated(!!userToken);
    };
    
    checkAuth();
    
    // Listen for storage changes (for multi-tab support)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);
  
  // Mock login/logout functions
  const login = (token: string) => {
    localStorage.setItem('userToken', token);
    setIsAuthenticated(true);
  };
  
  const logout = () => {
    localStorage.removeItem('userToken');
    setIsAuthenticated(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/authenticate">
            <AuthenticationPage />
          </Route>
          <Route path="/home">
            <Home />
          </Route>
          <Route path="/dashboard">
            <Dashboard />
          </Route>
          <Route path="/webauthn-test">
            <WebAuthnTest />
          </Route>
          <Route path="/face-id-test">
            <FaceIDTest />
          </Route>
          <Route path="/data-ownership">
            <DataOwnershipPage />
          </Route>
          <Route path="/ai-permissions">
            <AIPermissionsPage />
          </Route>
          <Route path="/notifications">
            <NotificationsPage />
          </Route>
          <Route path="/settings">
            <SettingsPage />
          </Route>
          <Route path="/profile">
            <ProfilePage />
          </Route>
          <Route path="/verification">
            <VerificationPage />
          </Route>
          <Route path="/verification-options">
            <VerificationOptionsPage />
          </Route>
          <Route path="/capsule">
            <CapsulePage />
          </Route>
          <Route>
            <NotFoundPage />
          </Route>
        </Switch>
        
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;