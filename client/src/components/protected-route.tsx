import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  requireVerification?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireVerification = false 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    console.log("Protected route auth state:", { isLoading, isAuthenticated, userVerified: user?.isVerified });
    
    // Only check after we've tried to load the user
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to login");
        navigate('/login');
        return;
      }
      
      // Authentication required but user not verified
      if (requireVerification && !user?.isVerified) {
        console.log("User not verified, redirecting to verification");
        navigate('/verification');
        return;
      }
      
      console.log("User authenticated and verified (if required)");
    }
  }, [isLoading, isAuthenticated, user, navigate, requireVerification]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col space-y-3 p-6">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-5/6" />
        <Skeleton className="h-8 w-4/6" />
        <div className="pt-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // If authenticated (and verified if required), render the children
  if (isAuthenticated && (!requireVerification || user?.isVerified)) {
    return <>{children}</>;
  }

  // This should not be visible as the useEffect should navigate away
  return null;
}