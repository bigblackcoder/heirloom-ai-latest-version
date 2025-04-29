import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface FaceVerificationResult {
  success: boolean;
  confidence: number;
  message?: string;
  matched?: boolean;
  face_id?: string;
  results?: {
    age?: number;
    gender?: string;
    dominant_race?: string;
    dominant_emotion?: string;
  };
}

export function useFaceVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState<FaceVerificationResult | null>(null);
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  // Simulate verification process for demo purposes
  const simulateVerification = useCallback(() => {
    setIsVerifying(true);
    setProgress(0);
    setVerificationResult(null);
    
    // Show toast to indicate verification has started
    toast({
      title: "Verification Started",
      description: "Scanning face for verification...",
    });
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Simulate successful verification after 100% progress
          setTimeout(() => {
            const mockResult: FaceVerificationResult = {
              success: true,
              confidence: 97.5,
              matched: true,
              face_id: 'face_' + Math.random().toString(36).substring(2, 10),
              results: {
                age: 32,
                gender: 'Male',
                dominant_race: 'white',
                dominant_emotion: 'neutral'
              },
              message: 'Identity verified with high confidence'
            };
            
            setVerificationResult(mockResult);
            setIsVerifying(false);
            
            // Show success toast
            toast({
              title: "Verification Complete",
              description: "Your identity has been successfully verified.",
              variant: "default",
            });
            
            // Navigate to dashboard after success
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          }, 500);
          
          return 100;
        }
        return newProgress;
      });
    }, 200);
    
    // Clean up interval
    return () => clearInterval(interval);
  }, [toast, navigate]);
  
  // Verify face with API
  const verifyFace = useCallback(async (base64Image: string, userId?: string) => {
    setIsVerifying(true);
    setProgress(0);
    
    try {
      // Start with initial progress
      setProgress(10);
      
      // Make API request to verify face
      const response = await fetch('/api/verification/face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          user_id: userId,
          save_to_db: true,
        }),
      });
      
      setProgress(70);
      
      if (!response.ok) {
        throw new Error(`Verification failed with status: ${response.status}`);
      }
      
      const result: FaceVerificationResult = await response.json();
      setProgress(100);
      setVerificationResult(result);
      
      // Show appropriate toast based on result
      if (result.success) {
        toast({
          title: "Verification Successful",
          description: result.message || "Your identity has been verified.",
          variant: "default",
        });
        
        // Navigate to dashboard after success
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        toast({
          title: "Verification Failed",
          description: result.message || "Please try again.",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Face verification error:', error);
      
      // Handle error and show toast
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
      
      setVerificationResult({
        success: false,
        confidence: 0,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      });
      
      return null;
    } finally {
      setIsVerifying(false);
    }
  }, [toast, navigate]);
  
  return {
    isVerifying,
    progress,
    verificationResult,
    verifyFace,
    simulateVerification,
  };
}