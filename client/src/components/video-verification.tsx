import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useFaceVerification } from '@/hooks/use-face-verification';

export function VideoVerification() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const {
    isVerifying,
    isRecording,
    recordingTime,
    progress,
    verificationResult,
    startVideoRecording,
    stopVideoRecording
  } = useFaceVerification();

  // Initialize camera
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    }

    setupCamera();
    
    // Clean up camera on unmount
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Format recording time
  const formatTime = (timeInSeconds: number) => {
    return timeInSeconds.toFixed(1);
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardHeader className="bg-primary/5">
        <CardTitle>Video Verification</CardTitle>
        <CardDescription>
          Verify your identity using a short video. This provides higher accuracy than static images.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0 relative">
        {/* Video preview */}
        <div className="relative aspect-video bg-black overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/75 text-white text-sm px-3 py-1 rounded-full">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
              <span>REC {formatTime(recordingTime)}s</span>
            </div>
          )}
          
          {/* Verification overlay */}
          {isVerifying && !isRecording && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="text-white text-lg mb-2 font-medium">Verifying...</div>
              <Progress value={progress} className="w-3/4 h-2" />
            </div>
          )}
          
          {/* Result overlay */}
          {verificationResult && !isVerifying && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${
              verificationResult.success ? 'bg-green-500/20' : 'bg-red-500/20'
            } backdrop-blur-sm`}>
              <div className={`text-xl mb-2 font-bold ${
                verificationResult.success ? 'text-green-600' : 'text-red-600'
              }`}>
                {verificationResult.success ? 'Verification Successful' : 'Verification Failed'}
              </div>
              <div className="text-sm text-center text-gray-800 max-w-xs px-4">
                {verificationResult.message || 
                  (verificationResult.success 
                    ? 'Your identity has been verified successfully.' 
                    : 'Could not verify your identity. Please try again.')}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between p-4 border-t">
        <div className="text-sm text-muted-foreground">
          {cameraActive 
            ? 'Camera connected' 
            : 'Please grant camera access'}
        </div>
        
        <div className="flex gap-2">
          {!isRecording && !isVerifying && (
            <Button 
              onClick={() => videoRef.current && startVideoRecording(videoRef.current)}
              disabled={!cameraActive || isVerifying}
              variant="default"
            >
              Start Verification
            </Button>
          )}
          
          {isRecording && (
            <Button 
              onClick={stopVideoRecording}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500/10"
            >
              Stop Recording
            </Button>
          )}
          
          {verificationResult && !isVerifying && (
            <Button 
              onClick={() => videoRef.current && startVideoRecording(videoRef.current)}
              variant="outline"
            >
              Try Again
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}