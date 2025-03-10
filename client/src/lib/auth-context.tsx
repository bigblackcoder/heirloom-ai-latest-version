import { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from './queryClient';
import { User } from './types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  setUserAfterVerification: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiRequest({
          url: '/api/auth/me',
          method: 'GET'
        });
        setUser(userData);
      } catch (error) {
        // Not authenticated, that's okay
        console.log('User not authenticated');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiRequest({
        url: '/api/auth/login',
        method: 'POST',
        body: { username, password }
      });
      
      setUser(response.user);
      toast({
        title: 'Login Successful',
        description: 'Welcome back to Heirloom',
      });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiRequest({
        url: '/api/auth/register',
        method: 'POST',
        body: userData
      });
      
      setUser(response.user);
      toast({
        title: 'Registration Successful',
        description: 'Welcome to Heirloom Identity Platform',
      });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Could not create account',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiRequest({
        url: '/api/auth/logout',
        method: 'POST'
      });
      setUser(null);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the user state even if the server request fails
      setUser(null);
    }
  };

  // Helper function to set the user after verification
  const setUserAfterVerification = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        setUserAfterVerification
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}