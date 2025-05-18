import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { startRegistration, startAuthentication } from '../../shared/webauthn';
import { useToast } from "@/hooks/use-toast";

interface BiometricAuthProps {
  userId: string;
  username?: string;
  mode: 'register' | 'authenticate';
  onSuccess: (result: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export default function BiometricAuth({
  userId,
  username,
  mode,
  onSuccess,
  onError,
  onCancel
}: BiometricAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [deviceType, setDeviceType] = useState<{
    os: string | null;
    authenticatorType: string | null;
    isMobile: boolean;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Detect device capabilities on component mount
    const ua = navigator.userAgent;
    
    // Detect operating system and authenticator type
    let os = null;
    let authenticatorType = null;
    
    // iOS detection
    if (/iPhone|iPad|iPod/.test(ua)) {
      if (/iPhone/.test(ua)) {
        os = "iOS";
        // iPhone X and newer use Face ID
        authenticatorType = /iPhone X/.test(ua) || /iPhone 1[1-9]/.test(ua) ? "Face ID" : "Touch ID";
      } else if (/iPad/.test(ua)) {
        os = "iPadOS";
        authenticatorType = "Touch ID";
      }
    } 
    // Android detection
    else if (/Android/.test(ua)) {
      os = "Android";
      authenticatorType = "Fingerprint";
    }
    // macOS detection
    else if (/Mac OS X/.test(ua)) {
      os = "macOS";
      authenticatorType = "Touch ID";
    }
    // Windows detection
    else if (/Windows/.test(ua)) {
      os = "Windows";
      authenticatorType = "Windows Hello";
    }
    // Fallback
    else {
      os = "Other";
      authenticatorType = "Biometric Sensor";
    }
    
    setDeviceType({
      os,
      authenticatorType,
      isMobile: /iPhone|iPad|iPod|Android/.test(ua)
    });
    
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      toast({
        title: "Device Not Supported",
        description: "Your device or browser doesn't support biometric authentication.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleBiometricAuth = async () => {
    if (!window.PublicKeyCredential) {
      if (onError) onError("Your device doesn't support biometric authentication");
      return;
    }

    setIsLoading(true);
    try {
      let result;
      
      if (mode === 'register') {
        // Start registration process
        result = await startRegistration(userId, username);
      } else {
        // Start authentication process
        result = await startAuthentication(userId);
      }
      
      if (result.success) {
        toast({
          title: mode === 'register' ? "Registration Successful" : "Authentication Successful",
          description: `Your ${deviceType?.authenticatorType || 'biometric'} was successfully verified`,
          variant: "default"
        });
        onSuccess(result);
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-white/10 backdrop-blur-sm border-white/20">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          {deviceType?.authenticatorType && (
            <Badge variant="outline" className="mb-4 bg-[#2a5414]/40 text-white border-white/20">
              {deviceType.authenticatorType} Available
            </Badge>
          )}
          
          <div className="w-20 h-20 mb-4 rounded-full bg-[#2a5414]/40 flex items-center justify-center">
            {deviceType?.authenticatorType?.includes('Face') ? (
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="5" />
                <path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-2">
            {mode === 'register' ? 'Register Your Device' : 'Verify Your Identity'}
          </h3>
          
          <p className="text-white/70 mb-6 text-sm">
            {mode === 'register' 
              ? `Use your ${deviceType?.authenticatorType || 'device biometrics'} to securely register this device`
              : `Verify your identity using your ${deviceType?.authenticatorType || 'device biometrics'}`
            }
          </p>
          
          <Button
            onClick={handleBiometricAuth}
            disabled={isLoading || !window.PublicKeyCredential}
            className="w-full py-6 bg-[#7c9861] hover:bg-[#273414] text-white"
          >
            {isLoading ? 'Processing...' : `Use ${deviceType?.authenticatorType || 'Biometrics'}`}
          </Button>
          
          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              className="mt-3 text-white/70 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}