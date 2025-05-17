import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

// Pages
import HomePage from './pages/Home';
import FaceIDTest from './pages/FaceIDTest';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

/**
 * Main application component
 */
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="heirloom-ui-theme">
        <div className="min-h-screen bg-background">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/webauthn-test" component={FaceIDTest} />
          </Switch>
          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;