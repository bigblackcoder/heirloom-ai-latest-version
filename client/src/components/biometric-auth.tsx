import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { startRegistration, startAuthentication } from '@/lib/webauthn';
import { useToast } from "@/hooks/use-toast";

interface BiometricAuthProps {
  userId: string;
  username?: string;
  mode: 'register' | 'authenticate';
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

export function BiometricAuth({
  userId,
  username,
  mode,
  onSuccess,
  onError,
  onCancel
}: BiometricAuthProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      setStatus('biometrics-unsupported');
      onError('Your device does not support biometric authentication');
      return;
    }

    // Check if biometrics are available on this device
    if (
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    ) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(
        (available) => {
          if (!available) {
            setStatus('biometrics-unavailable');
            onError('Biometric authentication is not available on this device');
          } else {
            setStatus('ready');
          }
        }
      );
    } else {
      setStatus('ready');
    }
  }, [onError]);

  const handleRegister = async () => {
    setIsProcessing(true);
    setStatus('processing');
    
    try {
      const result = await startRegistration(userId, username);
      
      if (result.success) {
        setStatus('success');
        toast({
          title: "Registration Successful",
          description: "Your device has been registered for biometric authentication",
          variant: "default"
        });
        onSuccess(result);
      } else {
        setStatus('error');
        toast({
          title: "Registration Failed",
          description: result.error || "An error occurred during registration",
          variant: "destructive"
        });
        onError(result.error || "Registration failed");
      }
    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive"
      });
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAuthenticate = async () => {
    setIsProcessing(true);
    setStatus('processing');
    
    try {
      const result = await startAuthentication(userId);
      
      if (result.success) {
        setStatus('success');
        toast({
          title: "Authentication Successful",
          description: "Your identity has been verified",
          variant: "default"
        });
        onSuccess(result);
      } else {
        setStatus('error');
        toast({
          title: "Authentication Failed",
          description: result.error || "An error occurred during authentication",
          variant: "destructive"
        });
        onError(result.error || "Authentication failed");
      }
    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === 'biometrics-unsupported' || status === 'biometrics-unavailable') {
    return (
      <Card className="bg-[#2a5414]/30 backdrop-blur-sm border-0 text-white w-full max-w-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Biometric Authentication Unavailable</h3>
            <p className="text-white/70 mb-4">
              {status === 'biometrics-unsupported'
                ? "Your device doesn't support biometric authentication."
                : "Biometric authentication is not set up on this device."}
            </p>
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-[#4c9061]/20"
              onClick={onCancel}
            >
              Return to Face Scan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#2a5414]/30 backdrop-blur-sm border-0 text-white w-full max-w-sm">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center text-center">
          {status === 'processing' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-[#4c9061]/30 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#6cbe82] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Verifying Your Identity</h3>
              <p className="text-white/70 mb-4">Please follow your device's prompts to complete verification...</p>
              <div className="mt-2 flex justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-white mr-1 animate-[bounce_1s_infinite_0.2s]"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-white mr-1 animate-[bounce_1s_infinite_0.4s]"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-[bounce_1s_infinite_0.6s]"></div>
              </div>
            </>
          ) : status === 'success' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-[#4c9061]/30 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#6cbe82]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Verification Successful</h3>
              <p className="text-white/70 mb-4">Your identity has been verified successfully.</p>
              <Badge className="bg-[#4c9061] text-white mb-4">Secure Verification Complete</Badge>
            </>
          ) : status === 'error' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Verification Failed</h3>
              <p className="text-white/70 mb-4">Something went wrong with the verification process.</p>
              <div className="space-y-2">
                <Button 
                  variant="default" 
                  className="w-full bg-[#4c9061] hover:bg-[#5daf74] text-white"
                  onClick={mode === 'register' ? handleRegister : handleAuthenticate}
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-white/20 text-white hover:bg-[#4c9061]/20"
                  onClick={onCancel}
                >
                  Switch to Face Scan
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-[#4c9061]/30 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#6cbe82]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.5 14.5v-5A2.5 2.5 0 019 7h6a2.5 2.5 0 012.5 2.5v5A2.5 2.5 0 0115 17H9a2.5 2.5 0 01-2.5-2.5zM12 7V4M8 21h8M12 17v4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{mode === 'register' ? 'Register Your Device' : 'Verify Your Identity'}</h3>
              <p className="text-white/70 mb-6">
                {mode === 'register'
                  ? "Register your device's biometric authentication to protect your account."
                  : "Use your device's biometric authentication to verify your identity."}
              </p>
              <Button 
                variant="default" 
                className="w-full bg-[#4c9061] hover:bg-[#5daf74] text-white"
                onClick={mode === 'register' ? handleRegister : handleAuthenticate}
                disabled={isProcessing || status === 'biometrics-unsupported' || status === 'biometrics-unavailable'}
              >
                {mode === 'register' ? 'Register Device' : 'Authenticate'}
              </Button>
              {onCancel && (
                <Button 
                  variant="link" 
                  className="mt-2 text-white/70 hover:text-white"
                  onClick={onCancel}
                >
                  Use Face Scan Instead
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}