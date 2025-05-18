import React, { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';

// Import UI components
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

// Import pages
import AuthenticationPage from './pages/AuthenticationPage';
import WebAuthnTest from './pages/WebAuthnTest';
import DashboardPage from './pages/DashboardPage';

// Import styles
import './index.css';

const HomePage = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="home-page h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#273414] to-[#1d2810] text-white p-6">
      <div className="container max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Heirloom Identity Platform</h1>
        <p className="text-xl mb-8 text-[#e9f0e6]">Secure, intelligent authentication with privacy by design</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Button 
            size="lg" 
            className="bg-white text-[#273414] hover:bg-[#e9f0e6]" 
            onClick={() => setLocation('/authenticate')}
          >
            Authenticate
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-[#273414]"
            onClick={() => setLocation('/webauthn-test')}
          >
            Test WebAuthn
          </Button>
        </div>
      </div>
    </div>
  );
};

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = () => {
      // Mock authentication check for demo purposes
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
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/authenticate">
          <AuthenticationPage />
        </Route>
        <Route path="/webauthn-test">
          <WebAuthnTest />
        </Route>
        <Route path="/dashboard">
          {isAuthenticated ? (
            <DashboardPage onLogout={logout} />
          ) : (
            <div className="redirect-container p-8 text-center">
              <p className="mb-4">Please authenticate to access the dashboard</p>
              <Button onClick={() => window.location.href = '/authenticate'}>
                Go to Authentication
              </Button>
            </div>
          )}
        </Route>
        <Route component={NotFoundPage} />
      </Switch>
      
      <Toaster />
    </>
  );
}

export default App;