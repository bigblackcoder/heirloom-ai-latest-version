import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, CheckCircle2, XCircle, Fingerprint } from "lucide-react";
import { useLocation } from "wouter";

export default function VerificationTest() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [testInProgress, setTestInProgress] = useState(false);
  const [testResults, setTestResults] = useState<{
    biometric: {
      status: 'success' | 'failure' | 'pending';
      details?: string;
    };
    blockchain: {
      status: 'success' | 'failure' | 'pending';
      details?: string;
      data?: any;
    };
  }>({
    biometric: { status: 'pending' },
    blockchain: { status: 'pending' }
  });
  
  // Test biometric authentication
  const testBiometricAuth = async () => {
    setTestInProgress(true);
    
    // Reset test results
    setTestResults({
      biometric: { status: 'pending' },
      blockchain: { status: 'pending' }
    });
    
    toast({
      title: "Testing Biometric Authentication",
      description: "Simulating device biometric authentication..."
    });
    
    try {
      // First test basic biometric capability
      const biometricSupported = await checkBiometricSupport();
      
      if (!biometricSupported) {
        setTestResults(prev => ({
          ...prev,
          biometric: { 
            status: 'failure', 
            details: "Device doesn't support biometric authentication" 
          }
        }));
        return;
      }
      
      // Test biometric authentication with server
      const testUserId = "test_user_" + Math.random().toString(36).substring(2);
      const deviceInfo = {
        type: navigator.platform,
        userAgent: navigator.userAgent
      };
      
      // Call our test API
      const response = await fetch('/api/verification-test/biometric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: testUserId,
          device_info: deviceInfo
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTestResults(prev => ({
          ...prev,
          biometric: { 
            status: 'success', 
            details: `Device successfully authenticated with biometrics (ID: ${result.verification_id})` 
          }
        }));
        
        // Now test blockchain integration with the same user ID
        await testBlockchainIntegration(testUserId);
      } else {
        throw new Error(result.message || "Biometric test failed");
      }
      
    } catch (error) {
      console.error("Biometric test error:", error);
      setTestResults(prev => ({
        ...prev,
        biometric: { 
          status: 'failure', 
          details: error instanceof Error ? error.message : "Unknown error occurred" 
        }
      }));
    } finally {
      setTestInProgress(false);
    }
  };
  
  // Check if biometric authentication is supported
  const checkBiometricSupport = async (): Promise<boolean> => {
    try {
      // Check WebAuthn support
      if (typeof window.PublicKeyCredential !== 'undefined') {
        // Check if platform authenticator is available
        if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
          return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking biometric support:", error);
      return false;
    }
  };
  
  // Test blockchain integration with provided user ID
  const testBlockchainIntegration = async (userId: string) => {
    try {
      // Call our blockchain test API
      const response = await fetch('/api/verification-test/blockchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          verificationMethod: 'device',
          confidence: 0.95,
          deviceInfo: {
            type: navigator.platform,
            userAgent: navigator.userAgent
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTestResults(prev => ({
          ...prev,
          blockchain: { 
            status: 'success', 
            details: "Successfully recorded verification on blockchain",
            data: result.blockchain_data
          }
        }));
        
        toast({
          title: "Blockchain Integration Successful",
          description: "Verification data was successfully recorded on the blockchain"
        });
      } else {
        throw new Error(result.message || "Blockchain integration failed");
      }
      
    } catch (error) {
      console.error("Blockchain test error:", error);
      setTestResults(prev => ({
        ...prev,
        blockchain: { 
          status: 'failure', 
          details: error instanceof Error ? error.message : "Failed to integrate with blockchain" 
        }
      }));
      
      toast({
        variant: "destructive",
        title: "Blockchain Integration Failed",
        description: "Could not record verification on blockchain"
      });
    }
  };
  
  // Render a result card
  const renderResultCard = (title: string, status: 'success' | 'failure' | 'pending', details?: string, data?: any) => {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            {status === 'success' && <CheckCircle2 className="text-green-500 h-5 w-5" />}
            {status === 'failure' && <XCircle className="text-red-500 h-5 w-5" />}
            {status === 'pending' && <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin"></div>}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {details || (status === 'pending' ? "Waiting..." : "")}
          </p>
          
          {data && (
            <div className="mt-2 pt-2 border-t text-xs">
              <div className="font-semibold mb-1">Blockchain Data:</div>
              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-6">
      <div className="container max-w-md mx-auto px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="p-0 mr-2" 
            onClick={() => navigate("/verification")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Verification Test Suite</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Biometric & Blockchain Integration Test</CardTitle>
            <CardDescription>
              Test the integration between device biometrics and blockchain verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center my-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Fingerprint className="h-12 w-12 text-primary" />
              </div>
            </div>
            
            <p className="text-center text-sm mb-6">
              This will test if your device can use biometric authentication and if the verification can be recorded on the blockchain.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={testBiometricAuth} 
              disabled={testInProgress}
            >
              {testInProgress ? "Testing..." : "Run Verification Test"}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-4">
          <h2 className="text-lg font-medium mb-2">Test Results</h2>
          
          {renderResultCard(
            "Biometric Authentication", 
            testResults.biometric.status,
            testResults.biometric.details
          )}
          
          {renderResultCard(
            "Blockchain Integration", 
            testResults.blockchain.status,
            testResults.blockchain.details,
            testResults.blockchain.data
          )}
        </div>
        
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}