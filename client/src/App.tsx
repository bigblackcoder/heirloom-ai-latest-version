import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./lib/auth-context";
import { DeviceProvider } from "./lib/device-context";
import { queryClient } from "./lib/queryClient";
import ResponsiveLayout from "./components/responsive-layout";
import DeviceSwitcher from "./components/device-switcher";

import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Profile from "./pages/profile";
import Verification from "./pages/verification";
import Capsule from "./pages/capsule";
import Notifications from "./pages/notifications";
import AnimationsDemo from "./pages/animations-demo";
import NotFound from "./pages/not-found";
import ProtectedRoute from "./components/protected-route";

function Router() {
  return (
    <ResponsiveLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/profile">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>
        <Route path="/verification">
          <ProtectedRoute>
            <Verification />
          </ProtectedRoute>
        </Route>
        <Route path="/capsule">
          <ProtectedRoute>
            <Capsule />
          </ProtectedRoute>
        </Route>
        <Route path="/notifications">
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        </Route>
        <Route path="/animations-demo" component={AnimationsDemo} />
        <Route component={NotFound} />
      </Switch>
    </ResponsiveLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DeviceProvider>
          <DeviceSwitcher />
          <Router />
          <Toaster />
        </DeviceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;