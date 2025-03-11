// src/components/FaceVerification.jsx
import React, { useState, useRef, useEffect } from 'react';
import { supabase, getCurrentUser } from '../lib/supabaseClient';

const FaceVerification = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      mediaStreamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        await verifyFace(blob);
      };

      setIsRecording(true);
      mediaRecorder.start();

      // Stop recording after 3 seconds
      setTimeout(() => {
        stopRecording();
      }, 3000);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please ensure you have granted camera permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const verifyFace = async (videoBlob) => {
    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      const formData = new FormData();
      formData.append('video', videoBlob);
      formData.append('user_id', currentUser.id);

      const response = await fetch(`${import.meta.env.VITE_IDENTITY_CAPSULE_URL}/verify-face`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setVerified(true);
        setError(null);
      } else {
        throw new Error(data.message || 'Face verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message);
      setVerified(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Face Verification</h2>
      
      <div className="mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full rounded-lg border border-gray-300"
        />
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!currentUser}
          className={`px-4 py-2 rounded-lg ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRecording ? 'Stop Recording' : 'Start Verification'}
        </button>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {verified && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            Face verification successful!
          </div>
        )}

        {!currentUser && (
          <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            Please log in to use face verification.
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceVerification;
