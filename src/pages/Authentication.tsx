import { useState, useEffect } from 'react';
import { useNavigate } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Fingerprint, ShieldCheck, Loader2, Lock, UserCircle } from 'lucide-react';
import { BlockchainBiometricAuth } from '@/components/blockchain-biometric-auth';
import { useBlockchainBiometrics } from '@/hooks/use-blockchain-biometrics';

// Define form schemas
const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export function Authentication() {
  const [tab, setTab] = useState<'login' | 'register' | 'biometrics'>('login');
  const [userId, setUserId] = useState<number | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { detectDevice } = useBlockchainBiometrics();
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Register form
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
      firstName: '',
      lastName: '',
    },
  });

  // Detect device capabilities on mount
  useEffect(() => {
    const checkDevice = async () => {
      const info = await detectDevice();
      setDeviceInfo(info);
    };
    
    checkDevice();
  }, [detectDevice]);

  // Handle login form submission
  const onLoginSubmit = async (data: LoginForm) => {
    setIsLoggingIn(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }
      
      toast({
        title: 'Login successful!',
        description: 'Redirecting to your dashboard...',
        variant: 'default',
      });
      
      // Set the user ID for biometric verification
      setUserId(result.user.id);
      
      // We'll show biometric verification if device supports it
      if (deviceInfo?.supportsBiometrics) {
        // Show biometric option
      } else {
        // Redirect to dashboard after a short delay
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error: any) {
      toast({
        title: 'Login Error',
        description: error.message || 'Failed to login. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle register form submission
  const onRegisterSubmit = async (data: RegisterForm) => {
    setIsRegistering(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }
      
      toast({
        title: 'Registration successful!',
        description: 'Your account has been created.',
        variant: 'default',
      });
      
      // Set the user ID for biometric registration
      setUserId(result.user.id);
      
      // Switch to biometric registration if device supports it
      if (deviceInfo?.supportsBiometrics) {
        setTab('biometrics');
      } else {
        // Switch to login tab if biometrics not supported
        setTab('login');
        loginForm.reset({
          username: data.username,
          password: '',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Registration Error',
        description: error.message || 'Failed to register. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle successful biometric authentication
  const handleBiometricSuccess = (result: { userId: number; verified: boolean }) => {
    toast({
      title: 'Biometric Verification Successful',
      description: 'Your identity has been verified using your device biometric.',
      variant: 'default',
    });
    
    // Redirect to dashboard after a short delay
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  // Handle biometric authentication error
  const handleBiometricError = (error: string) => {
    toast({
      title: 'Biometric Verification Failed',
      description: error,
      variant: 'destructive',
    });
  };

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Heirloom Identity</CardTitle>
          <CardDescription className="text-center">
            Secure and private identity verification
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs 
            defaultValue={tab} 
            value={tab} 
            onValueChange={(value) => setTab(value as 'login' | 'register' | 'biometrics')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-4">
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      type="text" 
                      placeholder="Enter your username"
                      {...loginForm.register('username')}
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.username.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Enter your password"
                      {...loginForm.register('password')}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoggingIn}>
                    {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoggingIn ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              </form>
              
              {userId && deviceInfo?.supportsBiometrics && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <ShieldCheck className="mr-1 h-4 w-4 text-primary" />
                    Biometric Authentication
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You can also use your device biometric for secure authentication.
                  </p>
                  <BlockchainBiometricAuth
                    userId={userId}
                    onSuccess={handleBiometricSuccess}
                    onError={handleBiometricError}
                    mode="verify"
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="register" className="mt-4">
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        type="text" 
                        placeholder="John"
                        {...registerForm.register('firstName')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        type="text" 
                        placeholder="Doe"
                        {...registerForm.register('lastName')}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com"
                      {...registerForm.register('email')}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input 
                      id="register-username" 
                      type="text" 
                      placeholder="Choose a username"
                      {...registerForm.register('username')}
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.username.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input 
                      id="register-password" 
                      type="password" 
                      placeholder="Choose a password"
                      {...registerForm.register('password')}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isRegistering}>
                    {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isRegistering ? 'Creating account...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="biometrics" className="mt-4">
              <div className="text-center mb-4">
                <UserCircle className="h-12 w-12 text-primary mx-auto mb-2" />
                <h3 className="text-lg font-medium">Set Up Biometric Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Enhance your account security by adding biometric verification.
                </p>
              </div>
              
              {userId && (
                <BlockchainBiometricAuth
                  userId={userId}
                  onSuccess={handleBiometricSuccess}
                  onError={handleBiometricError}
                  mode="register"
                />
              )}
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setTab('login')}
                >
                  Skip for now
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center pt-0">
          <p className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t w-full">
            <span className="text-primary">Heirloom Identity Platform</span> - Secure identity verification that respects your privacy
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}