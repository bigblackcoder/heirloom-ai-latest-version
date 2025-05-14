import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import Verification from "@/pages/verification";
import Dashboard from "@/pages/dashboard";
import Capsule from "@/pages/capsule";
import Notifications from "@/pages/notifications";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Achievements from "@/pages/achievements";
import Demo from "@/pages/demo";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/verification" component={Verification} />
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
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className={`min-h-screen bg-background ${isFullWidthPage ? 'w-full' : 'max-w-md mx-auto'} overflow-hidden relative`}>
          <Router />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
