import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

// Define user type
export type User = {
  id: number;
  username: string;
  email: string | null;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  memberSince?: string;
  avatar?: string;
};

// Auth context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  registerBiometric: (userId: string, username?: string) => Promise<any>;
  authenticateBiometric: (userId: string) => Promise<any>;
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
    refetchInterval: 1000 * 60 * 30, // 30 minutes,
    select: (data): User | null => {
      // Handle when the data is null or not a user
      if (!data || typeof data !== 'object') return null;
      
      // Try to map the response to our User type
      const userData = data as any;
      return {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName || undefined,
        lastName: userData.lastName || undefined,
        isVerified: !!userData.isVerified,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: userData.updatedAt || new Date().toISOString(),
        memberSince: userData.memberSince || userData.createdAt,
        avatar: userData.avatar || undefined
      };
    }
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
    onSuccess: (data) => {
      // Set user data directly in cache to prevent flash of unauthenticated content
      if (data && data.user) {
        queryClient.setQueryData(['/api/auth/me'], data.user);
      }
      
      // Then refetch to ensure we have the latest data
      setTimeout(() => {
        refetchUser();
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      }, 500);
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
      // Clear user data in cache
      queryClient.setQueryData(['/api/auth/me'], null);
      
      // Then invalidate all queries and clear cache
      setTimeout(() => {
        queryClient.invalidateQueries();
        queryClient.clear();
      }, 500);
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
  
  // Biometric registration mutation
  const registerBiometricMutation = useMutation({
    mutationFn: async ({ userId, username }: { userId: string, username?: string }) => {
      return apiRequest({
        url: '/api/webauthn/register/status',
        method: 'POST',
        body: { userId }
      });
    }
  });
  
  // Biometric authentication mutation
  const authenticateBiometricMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      return apiRequest({
        url: '/api/webauthn/authenticate/status',
        method: 'POST',
        body: { userId }
      });
    },
    onSuccess: (data) => {
      // Update user verification status
      if (data && data.success && user) {
        const updatedUser = { 
          ...user, 
          isVerified: true
        };
        queryClient.setQueryData(['/api/auth/me'], updatedUser);
        
        // Invalidate queries to refresh data
        setTimeout(() => {
          refetchUser();
          queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        }, 500);
      }
    }
  });
  
  // Initialize auth
  useEffect(() => {
    setIsInitialized(true);
  }, []);
  
  // Login function
  const login = async (username: string, password: string) => {
    try {
      const response = await loginMutation.mutateAsync({ username, password });
      
      // Ensure user data is updated in the cache
      if (response && response.user) {
        queryClient.setQueryData(['/api/auth/me'], response.user);
        
        // Force a refetch to confirm we have the latest data
        setTimeout(() => {
          refetchUser();
        }, 100);
      }
      
      toast({
        title: 'Login successful',
        description: 'Welcome back to Heirloom!'
      });
      
      // Return the response so the login component can handle redirection
      return response;
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
      const result = await signupMutation.mutateAsync({ username, email, password });
      toast({
        title: 'Account created',
        description: 'Your account has been successfully created!'
      });
      
      // Auto login after signup if response contains user data
      if (result && result.user) {
        // Set user data directly in cache
        queryClient.setQueryData(['/api/auth/me'], result.user);
        
        // Also perform a login to establish a session
        try {
          await login(username, password);
        } catch (error) {
          console.error('Auto-login error after signup:', error);
          // If auto-login fails, we already have an account, so just continue
        }
      }
      
      return result;
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
  
  // Register biometric function
  const registerBiometric = async (userId: string, username?: string) => {
    try {
      // First check if the user has registered biometrics before
      const statusResult = await registerBiometricMutation.mutateAsync({ userId, username });
      
      // Return the result which can be used by the BiometricAuth component
      return statusResult;
    } catch (error) {
      console.error('Biometric registration error:', error);
      toast({
        variant: 'destructive',
        title: 'Biometric Registration Failed',
        description: error instanceof Error ? error.message : 'There was an error registering your biometrics'
      });
      throw error;
    }
  };
  
  // Authenticate with biometrics function
  const authenticateBiometric = async (userId: string) => {
    try {
      // Fall back to direct API call if mutation fails
      try {
        // First check if the user has biometrics registered using the mutation
        const statusResult = await authenticateBiometricMutation.mutateAsync({ userId });
        
        // If successful, update the user's verification status
        if (statusResult.success) {
          toast({
            title: 'Identity Verified',
            description: 'Your identity has been successfully verified'
          });
        }
        
        // Return the result which can be used by the BiometricAuth component
        return statusResult;
      } catch (mutationError) {
        // If mutation fails, try direct API call
        console.log('Falling back to direct API call for biometric authentication');
        const response = await fetch('/api/webauthn/authentication/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        
        if (!response.ok) {
          throw new Error('Failed to authenticate with biometrics');
        }
        
        const result = await response.json();
        return result;
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'There was an error verifying your identity'
      });
      throw error;
    }
  };
  
  // Determine if we're in a loading state
  const isLoading = 
    isUserLoading || 
    loginMutation.isPending || 
    logoutMutation.isPending || 
    registerBiometricMutation.isPending || 
    authenticateBiometricMutation.isPending;
  
  // Cast user to User | null to fix TypeScript error
  const safeUser: User | null = user === undefined ? null : user;
  
  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        user: safeUser,
        isLoading,
        isAuthenticated: !!safeUser,
        login,
        logout,
        signup,
        registerBiometric,
        authenticateBiometric
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