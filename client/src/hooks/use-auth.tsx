import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

// Define user type
type User = {
  id: number;
  username: string;
  email: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

// Auth context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider props
type AuthProviderProps = {
  children: ReactNode;
};

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Fetch current user
  const { 
    data: user, 
    isLoading: isUserLoading,
    refetch: refetchUser 
  } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: isInitialized,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 30, // 30 minutes
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      return apiRequest({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials
      });
    },
    onSuccess: () => {
      refetchUser();
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    }
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest({
        url: '/api/auth/logout',
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      queryClient.clear();
    }
  });
  
  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async (userData: { username: string; email: string; password: string }) => {
      return apiRequest({
        url: '/api/auth/register',
        method: 'POST',
        body: userData
      });
    }
  });
  
  // Initialize auth
  useEffect(() => {
    setIsInitialized(true);
  }, []);
  
  // Login function
  const login = async (username: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ username, password });
      toast({
        title: 'Login successful',
        description: 'Welcome back to Heirloom!'
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid username or password'
      });
      throw error;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out'
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: 'There was an error logging out'
      });
      throw error;
    }
  };
  
  // Signup function
  const signup = async (username: string, email: string, password: string) => {
    try {
      await signupMutation.mutateAsync({ username, email, password });
      toast({
        title: 'Account created',
        description: 'Your account has been successfully created!'
      });
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: error instanceof Error ? error.message : 'There was an error creating your account'
      });
      throw error;
    }
  };
  
  // Determine if we're in a loading state
  const isLoading = isUserLoading || loginMutation.isPending || logoutMutation.isPending;
  
  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        signup
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}