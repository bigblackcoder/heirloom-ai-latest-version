import { useState, useEffect } from "react";
import { useNativeBiometrics } from "@/hooks/use-native-biometrics";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BiometricVerificationProps {
  userId: string;
  onVerificationComplete: (result: {
    success: boolean;
    method: string;
    details?: any;
  }) => void;
}

export default function BiometricVerification({
  userId,
  onVerificationComplete
}: BiometricVerificationProps) {
  const [activeMethod, setActiveMethod] = useState<"face" | "fingerprint" | "deepface">("deepface");
  const [progress, setProgress] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  
  const {
    isSupported,
    availableMethods,
    platform,
    loading,
    error,
    checkSupport,
    authenticate
  } = useNativeBiometrics();
  
  // Check biometric support on component mount
  useEffect(() => {
    checkSupport();
  }, [checkSupport]);
  
  // Handle native biometric authentication
  const handleNativeBiometricAuth = async () => {
    if (!userId) {
      return;
    }
    
    setProgress(30);
    
    try {
      const result = await authenticate(userId);
      
      setProgress(100);
      setIsComplete(true);
      setResult(result);
      
      onVerificationComplete({
        success: result.success && result.verified === true,
        method: result.method || (activeMethod === "face" ? "FaceID" : "Fingerprint"),
        details: result.details
      });
    } catch (error) {
      console.error("Biometric verification error:", error);
      setProgress(0);
      setIsComplete(false);
      
      onVerificationComplete({
        success: false,
        method: activeMethod === "face" ? "FaceID" : "Fingerprint",
        details: { error: error instanceof Error ? error.message : "Unknown error" }
      });
    }
  };
  
  // Handle DeepFace verification
  const handleDeepFaceVerification = async (imageData: string) => {
    if (!userId || !imageData) {
      return;
    }
    
    setProgress(30);
    
    try {
      // Remove data URL prefix if present
      const base64Data = imageData.includes(',') 
        ? imageData.split(',')[1] 
        : imageData;
      
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('image_data', base64Data);
      
      const response = await fetch('/verify', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      setProgress(100);
      setIsComplete(true);
      setResult(result);
      
      onVerificationComplete({
        success: result.success && result.verified === true,
        method: "DeepFace",
        details: result
      });
    } catch (error) {
      console.error("DeepFace verification error:", error);
      setProgress(0);
      setIsComplete(false);
      
      onVerificationComplete({
        success: false,
        method: "DeepFace",
        details: { error: error instanceof Error ? error.message : "Unknown error" }
      });
    }
  };
  
  // Simulate deepface verification progress for demo
  const simulateDeepFaceProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsComplete(true);
        
        // Simulate successful verification
        const simulatedResult = {
          success: true,
          verified: true,
          confidence: 95,
          method: "DeepFace",
          blockchain_data: {
            verified: true,
            hitToken: "0x123...",
            metadata: {
              verificationMethod: "face",
              verificationTimestamp: new Date().toISOString()
            }
          }
        };
        
        setResult(simulatedResult);
        
        onVerificationComplete({
          success: true,
          method: "DeepFace",
          details: simulatedResult
        });
      }
    }, 200);
    
    return () => clearInterval(interval);
  };
  
  // For demo, start simulation when DeepFace tab is shown
  useEffect(() => {
    if (activeMethod === "deepface" && !isComplete && progress === 0) {
      const cleanup = simulateDeepFaceProgress();
      return cleanup;
    }
  }, [activeMethod, isComplete, progress]);
  
  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs 
        defaultValue={isSupported ? "face" : "deepface"} 
        value={activeMethod}
        onValueChange={(value) => setActiveMethod(value as "face" | "fingerprint" | "deepface")}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="deepface" disabled={isComplete}>
            DeepFace
          </TabsTrigger>
          <TabsTrigger value="face" disabled={!availableMethods.includes("face") || isComplete}>
            FaceID
          </TabsTrigger>
          <TabsTrigger value="fingerprint" disabled={!availableMethods.includes("fingerprint") || isComplete}>
            Fingerprint
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="deepface" className="relative">
          <div className="relative w-64 h-64 mx-auto">
            <div className="w-full h-full rounded-full border-2 border-green-500/30 flex items-center justify-center bg-green-900/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-transparent animate-scan" />
              
              {isComplete ? (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-green-500/20 w-32 h-32 rounded-full flex items-center justify-center"
                >
                  <svg className="w-16 h-16 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </motion.div>
              ) : (
                <div className="relative h-24 w-24">
                  <div className="h-full w-full rounded-full overflow-hidden bg-black/50 flex items-center justify-center">
                    <div className="text-white text-xl">AI</div>
                  </div>
                  <motion.div 
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              )}
            </div>
            
            {/* Progress circle */}
            <svg className="absolute inset-0 w-full h-full z-20" viewBox="0 0 290 290">
              <motion.circle
                className="text-green-500"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="130"
                cx="145"
                cy="145"
                strokeDasharray="817"
                strokeDashoffset={817 - (817 * progress) / 100}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </svg>
          </div>
          
          <div className="mt-6 text-center">
            <h3 className="text-lg font-semibold">DeepFace Verification</h3>
            <p className="text-sm text-gray-500">Advanced AI facial recognition</p>
          </div>
        </TabsContent>
        
        <TabsContent value="face" className="relative">
          <div className="relative w-64 h-64 mx-auto">
            <div className="w-full h-full rounded-full border-2 border-blue-500/30 flex items-center justify-center bg-blue-900/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent animate-scan" />
              
              <button 
                onClick={handleNativeBiometricAuth}
                disabled={loading || isComplete}
                className="bg-blue-500/20 w-32 h-32 rounded-full flex items-center justify-center hover:bg-blue-500/30 transition-colors"
              >
                {isComplete ? (
                  <svg className="w-16 h-16 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg className="w-16 h-16 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 5V3" />
                    <path d="M19 12h2" />
                    <path d="M12 19v2" />
                    <path d="M5 12H3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <h3 className="text-lg font-semibold">Apple FaceID</h3>
            <p className="text-sm text-gray-500">Authenticate with your device's facial recognition</p>
          </div>
        </TabsContent>
        
        <TabsContent value="fingerprint" className="relative">
          <div className="relative w-64 h-64 mx-auto">
            <div className="w-full h-full rounded-full border-2 border-purple-500/30 flex items-center justify-center bg-purple-900/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent animate-scan" />
              
              <button 
                onClick={handleNativeBiometricAuth}
                disabled={loading || isComplete}
                className="bg-purple-500/20 w-32 h-32 rounded-full flex items-center justify-center hover:bg-purple-500/30 transition-colors"
              >
                {isComplete ? (
                  <svg className="w-16 h-16 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg className="w-16 h-16 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 11c1.66 0 3-1.34 3-3S13.66 5 12 5 9 6.34 9 8s1.34 3 3 3z" />
                    <path d="M12 13c-2.21 0-4 1.79-4 4v3h8v-3c0-2.21-1.79-4-4-4z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <h3 className="text-lg font-semibold">Fingerprint</h3>
            <p className="text-sm text-gray-500">Authenticate with your device's fingerprint sensor</p>
          </div>
        </TabsContent>
      </Tabs>
      
      {isComplete && result && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
          <h4 className="font-semibold text-green-800">Verification Successful</h4>
          <p className="text-sm text-green-700">
            Method: {result.method || activeMethod} 
            {result.confidence && ` (${result.confidence}% confidence)`}
          </p>
          {result.blockchain_data && (
            <p className="text-xs text-green-600 mt-2">
              Blockchain verification: {result.blockchain_data.verified ? 'Completed' : 'Pending'}
            </p>
          )}
        </div>
      )}
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
          <h4 className="font-semibold text-red-800">Verification Failed</h4>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
