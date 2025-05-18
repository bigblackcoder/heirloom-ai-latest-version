import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Define the user type
export interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  memberSince?: string;
  avatar?: string;
}

// Define the auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Props for the auth provider
interface AuthProviderProps {
  children: ReactNode;
}

// The auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const queryClient = useQueryClient();
  
  // Check if the user is authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('userToken');
      setIsAuthenticated(!!token);
    };
    
    checkAuth();
    
    // Add event listener for storage changes (for multi-tab support)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);
  
  // Mock user data for demo
  const mockUser: User = {
    id: 1,
    username: 'demo_user',
    email: 'user@example.com',
    firstName: 'Demo',
    lastName: 'User',
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    memberSince: '2025-01-01T00:00:00.000Z',
  };
  
  // For this demo, we're using mock data instead of a real API call
  const { data: user, isLoading, refetch: refreshUser } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      // Only return the mock user if authenticated
      if (isAuthenticated) {
        return mockUser;
      }
      throw new Error('Not authenticated');
    },
    enabled: isAuthenticated, // Only run the query if authenticated
    retry: false,
  });
  
  // Login function
  const login = (token: string) => {
    localStorage.setItem('userToken', token);
    setIsAuthenticated(true);
    // Refresh the user data
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('userToken');
    setIsAuthenticated(false);
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    // Also clear all query cache when logging out
    queryClient.clear();
  };
  
  // Provide the auth context value
  const contextValue: AuthContextType = {
    user: user || null,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser: () => refreshUser(),
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}