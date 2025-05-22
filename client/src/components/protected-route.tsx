
import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: ReactNode;
  requireVerified?: boolean;
}

export function ProtectedRoute({ children, requireVerified = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Set a timeout to prevent infinite loading state
    const authTimeout = setTimeout(() => {
      setCheckingAuth(false);
    }, 2000);

    // Check authentication status
    if (!isLoading) {
      clearTimeout(authTimeout);
      setCheckingAuth(false);
      
      if (!isAuthenticated) {
        console.log('ProtectedRoute: User not authenticated, redirecting to login');
        toast({
          title: "Authentication required",
          description: "Please log in to access this page",
          variant: "destructive"
        });
        
        // Small delay before redirect to allow toast to be seen
        setTimeout(() => navigate('/login'), 100);
      } else if (requireVerified && user && !user.isVerified) {
        console.log('ProtectedRoute: User not verified, redirecting to verification');
        toast({
          title: "Verification required",
          description: "Please verify your identity to access this feature",
          variant: "destructive"
        });
        
        // Small delay before redirect
        setTimeout(() => navigate('/verification'), 100);
      }
    }

    return () => clearTimeout(authTimeout);
  }, [isAuthenticated, isLoading, user, navigate, requireVerified, toast]);

  // Show loading skeleton while checking auth state
  if (isLoading || checkingAuth) {
    return (
      <div className="w-full max-w-md mx-auto p-4 mt-16">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  // If we're still rendering after the checks, it means the user is authenticated
  // (and verified if required)
  return <>{children}</>;
}
