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
    // Check if the user is loaded (not loading) and not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
    
    // If verification is required, check if the user is verified
    if (requireVerification && !isLoading && isAuthenticated && !user?.isVerified) {
      navigate('/verification');
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