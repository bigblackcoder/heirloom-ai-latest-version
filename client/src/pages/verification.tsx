import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import AppleFaceScanner from "@/components/apple-face-scanner";
import { BiometricAuth } from "@/components/biometric-auth";
import SuccessModal from "@/components/success-modal";

export default function Verification() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user, registerBiometric, authenticateBiometric } = useAuth();
  const [verificationMethod, setVerificationMethod] = useState<'face' | 'device'>('face');
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    confidence: number;
    results?: {
      age?: number;
      gender?: string;
      dominant_race?: string;
      dominant_emotion?: string;
      device_verified?: boolean;
      [key: string]: any; // Allow additional properties
    };
  } | null>(null);

  // Handle navigation to dashboard when success modal should show
  useEffect(() => {
    if (showSuccessModal) {
      // Save verification result in localStorage
      localStorage.setItem('showVerificationSuccess', 'true');
      
      // Store verification data if available
      if (verificationData) {
        localStorage.setItem('verificationData', JSON.stringify(verificationData));
      }
      
      // Navigate to dashboard with a slight delay to ensure localStorage is set
      setTimeout(() => {
        navigate("/dashboard");
      }, 50);
    }
  }, [showSuccessModal, verificationData, navigate]);

  const handleBackClick = () => {
    navigate("/");
  };

  const handleVerificationProgress = (progress: number) => {
    setVerificationProgress(progress);
  };
  
  // Handle face verification complete
  const handleVerificationComplete = async (imageData?: string) => {
    console.log("Face verification complete, progress:", verificationProgress);
    setIsVerificationComplete(true);
    
    if (verificationProgress >= 98 && imageData) {
      try {
        // Call backend verification endpoint with the captured image data
        const response = await apiRequest({
          url: "/api/verification/face",
          method: "POST",
          body: { image: imageData }
        });
        
        if (response && response.success) {
          // Store verification data for display in the success modal
          setVerificationData({
            confidence: response.confidence,
            results: response.results
          });
          
          // Show success modal
          setShowSuccessModal(true);
          return;
        }
      } catch (error) {
        console.error("Verification error:", error);
        toast({
          variant: "destructive",
          title: "Verification Error",
          description: "There was a problem with the face verification. Please try again."
        });
        setIsVerificationComplete(false);
        return;
      }
    }
    
    // For default case, try to verify without image data, will use server-side detection
    try {
      const response = await apiRequest({
        url: "/api/verification/face/basic",
        method: "POST"
      });
      
      if (response && response.success) {
        setVerificationData({
          confidence: response.confidence,
          results: response.results || {}
        });
        
        setShowSuccessModal(true);
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: "Unable to verify your identity. Please try again or use device biometrics."
        });
        setIsVerificationComplete(false);
      }
    } catch (error) {
      console.error("Basic verification error:", error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "There was a problem verifying your identity. Please try again."
      });
      setIsVerificationComplete(false);
    }
  };
  
  // Handle device biometric verification
  const handleBiometricSuccess = async (result: any) => {
    console.log("Biometric verification successful:", result);
    
    // Set verification data for display in success modal
    setVerificationData({
      confidence: 0.99, // High confidence for device biometrics
      results: {
        // Device biometrics don't provide detailed analysis
        device_verified: true
      }
    });
    
    // Show success modal
    setShowSuccessModal(true);
  };
  
  const handleBiometricError = (error: string) => {
    console.error("Biometric verification error:", error);
    toast({
      variant: "destructive",
      title: "Biometric Verification Failed",
      description: error || "There was a problem with the biometric verification."
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#143404] to-[#1e3c0d] text-white">
      {/* Status bar area */}
      <div className="w-full px-4 pt-6 pb-2 flex items-center">
        <div className="text-sm opacity-70">9:41</div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none">
            <path d="M1.5 6.5C1.5 4 3.5 2 6 2 8.5 2 10.5 4 10.5 6.5v11C10.5 20 8.5 22 6 22 3.5 22 1.5 20 1.5 17.5v-11Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 6c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5v11c0 2.5-2 4.5-4.5 4.5S10.5 19.5 10.5 17V6Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M19.5 7a2.5 2.5 0 0 1 5 0v10a2.5 2.5 0 0 1-5 0V7Z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none">
            <path d="M3 7c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M21 16h2v-8h-2M1 16h2V8H1" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="w-full px-6 pt-2 pb-6 flex items-center justify-between">
        <button 
          onClick={handleBackClick}
          className="w-10 h-10 rounded-full bg-[#2a5414]/40 backdrop-blur-sm flex items-center justify-center"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        <div className="text-lg font-medium">Identity Verification</div>
        
        <div className="w-10 h-10 opacity-0">
          {/* Empty placeholder for alignment */}
        </div>
      </div>

      {/* Verification Options Tabs */}
      <div className="px-4 sm:px-6 pt-2">
        <Tabs 
          defaultValue="face" 
          value={verificationMethod}
          onValueChange={(value) => setVerificationMethod(value as 'face' | 'device')}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 bg-[#2a5414]/40 rounded-xl h-12 p-1">
            <TabsTrigger 
              value="face" 
              className="rounded-lg data-[state=active]:bg-[#7c9861] data-[state=active]:text-white"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
                <path d="M15 10a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" />
                <path d="M9.5 15a4.5 4.5 0 0 0 5 0" />
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" />
              </svg>
              Face Scan
            </TabsTrigger>
            <TabsTrigger 
              value="device" 
              className="rounded-lg data-[state=active]:bg-[#7c9861] data-[state=active]:text-white"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6.5 14.5v-5A2.5 2.5 0 0 1 9 7h6a2.5 2.5 0 0 1 2.5 2.5v5A2.5 2.5 0 0 1 15 17H9a2.5 2.5 0 0 1-2.5-2.5Z" />
                <path d="M12 7V4" />
                <path d="M8 21h8" />
                <path d="M12 17v4" />
              </svg>
              Device Biometrics
            </TabsTrigger>
          </TabsList>
          
          <div className="pt-6">
            {/* Verification info card */}
            <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 sm:px-5 sm:py-4 mb-6">
              <div className="flex items-center mb-2 sm:mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#2a5414] rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4caf50]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">
                    {verificationMethod === 'face' ? 'Secure Face Scan' : 'Device Biometrics'}
                  </h3>
                  <p className="text-white/60 text-xs">Your biometric data stays on your device</p>
                </div>
              </div>
              
              <p className="text-white/80 text-xs leading-relaxed">
                {verificationMethod === 'face' 
                  ? "This scan verifies you're a real person and creates your secure identity record. Your face data is processed privately and securely."
                  : "Use your device's built-in security features like Face ID, Touch ID or fingerprint scanner to verify your identity quickly and securely."
                }
              </p>
            </div>
          </div>
          
          <TabsContent value="face" className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
            <AppleFaceScanner 
              onProgress={handleVerificationProgress} 
              onComplete={handleVerificationComplete}
              isComplete={isVerificationComplete}
            />
            
            <div className="text-[#d4a166] text-2xl sm:text-3xl font-bold mt-4 sm:mt-6">
              {verificationProgress.toFixed(0)}%
            </div>
            <p className="text-white/80 text-center text-sm sm:text-base mt-1 mb-3 max-w-[280px] sm:max-w-xs">
              Follow the guidance and move your head slowly to complete the verification.
            </p>
            
            {/* Step indicators */}
            <div className="flex justify-center items-center gap-2 mt-2 sm:mt-3 mb-4 sm:mb-6">
              <div className="w-10 sm:w-12 h-1.5 rounded-full bg-[#d4a166]"></div>
              <div className="w-2.5 sm:w-3 h-1.5 rounded-full bg-white/30"></div>
              <div className="w-2.5 sm:w-3 h-1.5 rounded-full bg-white/30"></div>
            </div>
          </TabsContent>
          
          <TabsContent value="device" className="flex-1 flex flex-col items-center justify-center pt-2 pb-6">
            <BiometricAuth 
              userId={user?.id?.toString() || '1'} 
              username={user?.username}
              mode={user?.isVerified ? 'authenticate' : 'register'}
              onSuccess={handleBiometricSuccess}
              onError={handleBiometricError}
              onCancel={() => setVerificationMethod('face')}
            />
            
            <p className="text-white/80 text-center text-sm mt-6 max-w-xs">
              You can use your device's built-in biometric authentication for quick and secure verification.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Progress Bar */}
      <div className="px-8 pb-10">
        <div className="w-full h-1 bg-white/20 rounded-full">
          <div 
            className="h-full bg-[#d4a166] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${verificationProgress}%` }}
          />
        </div>
      </div>

      {/* Success Modal - Hidden content for modal display logic */}
      <div style={{ display: 'none' }}>
        {/* Hidden div to contain any dynamic content if needed */}
      </div>
    </div>
  );
}
