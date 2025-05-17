import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SmileIcon, FingerprintIcon, ShieldCheckIcon } from "lucide-react";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";

interface BiometricAuthProps {
  onSuccess?: (credentialId: string) => void;
  onError?: (error: Error) => void;
  mode?: "register" | "verify";
}

export function BlockchainBiometricAuth({ 
  onSuccess, 
  onError, 
  mode = "verify" 
}: BiometricAuthProps) {
  const { user } = useAuth();
  const { 
    isSupported, 
    isBusy, 
    registerBiometric, 
    verifyBiometric,
    biometricType, 
    error 
  } = useBiometricAuth();

  const [activeTab, setActiveTab] = useState<string>("face");

  useEffect(() => {
    if (error && onError) {
      onError(new Error(error));
    }
  }, [error, onError]);

  const handleRegister = async () => {
    try {
      if (!user) {
        throw new Error("User must be logged in to register biometrics");
      }
      
      const result = await registerBiometric(user.id.toString());
      if (result && onSuccess) {
        onSuccess(result.credentialId);
      }
    } catch (err: any) {
      if (onError) {
        onError(err);
      }
    }
  };

  const handleVerify = async () => {
    try {
      if (!user) {
        throw new Error("User must be logged in to verify biometrics");
      }
      
      const result = await verifyBiometric(user.id.toString());
      if (result && onSuccess) {
        onSuccess(result.credentialId);
      }
    } catch (err: any) {
      if (onError) {
        onError(err);
      }
    }
  };

  if (!isSupported) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Biometric Authentication</CardTitle>
          <CardDescription>
            Your device doesn't support biometric authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 text-muted-foreground">
            <ShieldCheckIcon className="w-12 h-12 mb-2" />
            <p className="text-center">
              This device doesn't support the required biometric capabilities.
              Please try on a device with fingerprint or facial recognition.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Biometric Authentication</CardTitle>
        <CardDescription>
          {mode === "register" 
            ? "Register your biometric for secure blockchain-verified identity" 
            : "Verify your identity using your registered biometrics"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="face" disabled={biometricType !== "face" && biometricType !== "both"}>
              <SmileIcon className="w-4 h-4 mr-2" />
              Face ID
            </TabsTrigger>
            <TabsTrigger value="fingerprint" disabled={biometricType !== "fingerprint" && biometricType !== "both"}>
              <FingerprintIcon className="w-4 h-4 mr-2" />
              Fingerprint
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="face" className="pt-4">
            <div className="flex flex-col items-center justify-center p-6 border rounded-md bg-muted/30">
              <SmileIcon className="w-16 h-16 mb-4 text-primary" />
              <p className="text-center mb-4">
                {mode === "register" 
                  ? "Register your face as a secure biometric credential" 
                  : "Verify your identity using facial recognition"}
              </p>
              <div className="text-xs text-muted-foreground mb-4 text-center">
                <p>Your biometric data stays on your device.</p>
                <p>Only verification metadata is stored on the blockchain.</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="fingerprint" className="pt-4">
            <div className="flex flex-col items-center justify-center p-6 border rounded-md bg-muted/30">
              <FingerprintIcon className="w-16 h-16 mb-4 text-primary" />
              <p className="text-center mb-4">
                {mode === "register" 
                  ? "Register your fingerprint as a secure biometric credential" 
                  : "Verify your identity using fingerprint recognition"}
              </p>
              <div className="text-xs text-muted-foreground mb-4 text-center">
                <p>Your biometric data stays on your device.</p>
                <p>Only verification metadata is stored on the blockchain.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
            {error}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={mode === "register" ? handleRegister : handleVerify}
          disabled={isBusy}
        >
          {isBusy ? "Processing..." : mode === "register" ? "Register Biometric" : "Verify Identity"}
        </Button>
      </CardFooter>
    </Card>
  );
}