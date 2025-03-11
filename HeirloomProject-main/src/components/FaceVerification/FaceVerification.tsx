import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface FaceVerificationProps {
  userId: string;
  onVerificationComplete: (success: boolean) => void;
}

const FaceVerification = ({ userId, onVerificationComplete }: FaceVerificationProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Cleanup function to stop the camera when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      setError('Could not access camera');
      console.error(err);
    }
  };

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsVerifying(true);
    setError(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    // Convert canvas to blob
    try {
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg')
      );

      // Create file from blob
      const file = new File([blob], `${userId}-verification.jpg`, {
        type: 'image/jpeg'
      });

      // Upload to Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('face-verification')
        .upload(`${userId}/face-verification/${Date.now()}.jpg`, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('face-verification')
        .getPublicUrl(uploadData.path);

      // Call verification endpoint
      const response = await fetch('/api/v1/verify-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          imageUrl: urlData.publicUrl
        })
      });

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.statusText}`);
      }

      const result = await response.json();
      onVerificationComplete(result.verified);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      console.error(err);
      onVerificationComplete(false);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-full max-w-md">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full rounded-lg shadow-lg"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {error && (
        <div className="text-red-500">{error}</div>
      )}

      {!isCapturing ? (
        <button
          onClick={startCamera}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start Camera
        </button>
      ) : (
        <button
          onClick={captureAndVerify}
          disabled={isVerifying}
          className={`px-4 py-2 ${
            isVerifying 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600'
          } text-white rounded`}
        >
          {isVerifying ? 'Verifying...' : 'Verify Face'}
        </button>
      )}
    </div>
  );
};

export default FaceVerification;