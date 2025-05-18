import React, { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-unified-auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // If auth is still loading, show a loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-[#273414] text-center">
          <div className="w-12 h-12 border-4 border-[#273414] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to the authentication page
  if (!isAuthenticated) {
    // Use a React effect for the redirect to avoid issues with rendering
    React.useEffect(() => {
      navigate('/authenticate');
    }, [navigate]);
    
    // Return null to avoid flash of unprotected content
    return null;
  }
  
  // If authenticated, render the children
  return <>{children}</>;
}