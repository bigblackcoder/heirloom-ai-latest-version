import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useBiometricAuth } from '../hooks/useBiometricAuth';

export const BiometricAuth = () => {
  const [step, setStep] = useState(1);
  const [customError, setCustomError] = useState('');
  const [, setLocation] = useLocation();
  
  const { 
    isSupported, 
    isAvailable, 
    biometricType, 
    isLoading, 
    error: authError, 
    authenticate 
  } = useBiometricAuth();
  
  // Combine errors from hook and component
  const error = authError || customError;
  
  useEffect(() => {
    // Check if biometric authentication is available
    if (!isSupported) {
      setCustomError('Biometric authentication is not supported on this browser.');
    } else if (!isAvailable) {
      setCustomError('No biometric authenticator available on this device.');
    }
  }, [isSupported, isAvailable]);
  
  // Handle starting the real biometric authentication process
  const startBiometricAuth = async () => {
    try {
      setCustomError('');
      setStep(2);
      
      // Attempt to authenticate using device biometrics
      const success = await authenticate();
      
      if (success) {
        setStep(3);
        // Redirect to dashboard after successful authentication
        setTimeout(() => {
          setLocation('/dashboard');
        }, 1500);
      } else {
        // If authentication was not successful but no specific error was set
        // (this should rarely happen as errors are handled in the hook)
        if (!authError) {
          setCustomError('Authentication failed. Please try again.');
        }
        setStep(1);
      }
    } catch (err: any) {
      console.error('Biometric authentication error:', err);
      setCustomError(err.message || 'Authentication failed. Please try again.');
      setStep(1);
    }
  };
  
  // Icons for different biometric types
  const BiometricIcon = () => {
    if (biometricType === 'faceId') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6.625 2.655A9 9 0 0119 11a1 1 0 11-2 0 7 7 0 00-9.625-6.492 1 1 0 11-.75-1.853zM4.662 4.959A1 1 0 014.75 6.37 6.97 6.97 0 003 11a1 1 0 11-2 0 8.97 8.97 0 012.25-5.953 1 1 0 011.412-.088z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M5 11a5 5 0 1110 0 1 1 0 11-2 0 3 3 0 10-6 0c0 1.677-.345 3.276-.968 4.729a1 1 0 11-1.838-.789A9.964 9.964 0 015 11zm8.921 2.012a1 1 0 01.831 1.145 19.86 19.86 0 01-.545 2.436 1 1 0 11-1.92-.558c.207-.713.371-1.445.49-2.192a1 1 0 011.144-.83z" clipRule="evenodd" />
        </svg>
      );
    }
  };
  
  // Helper function to get the appropriate text for the biometric method
  const getBiometricText = () => {
    return biometricType === 'faceId' ? 'Face ID' : 'Fingerprint';
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Secure Identity Verification</h2>
            <p className="mt-2 text-sm text-gray-600">
              Verify your identity using your device's biometric authentication
            </p>
            {error && (
              <div className="p-3 mt-4 text-sm text-red-700 bg-red-100 rounded-md">
                {error}
              </div>
            )}
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <div className="space-y-6">
                {step === 1 && (
                  <div>
                    <div className="p-6 bg-white rounded-lg shadow-md">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 p-2 bg-indigo-100 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Secure Biometric Authentication</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Your biometric data never leaves your device. Only verification metadata is securely transmitted with CSRF protection.
                          </p>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={startBiometricAuth}
                      disabled={isLoading || !isSupported || !isAvailable}
                      className={`w-full py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center ${
                        isLoading || !isSupported || !isAvailable 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <BiometricIcon />
                          <span className="ml-2">Authenticate with {getBiometricText()}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                {step === 2 && (
                  <div className="text-center">
                    <div className="p-6 bg-white rounded-lg shadow-md mb-4 flex flex-col items-center">
                      <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
                        <div className="relative flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full">
                          <BiometricIcon />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {biometricType === 'faceId' ? 'Looking for Face ID' : 'Waiting for fingerprint'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Please use your {biometricType === 'faceId' ? 'Face ID' : 'fingerprint sensor'} to verify your identity
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      If no system prompt appears, your device may not support biometric authentication
                    </p>
                  </div>
                )}
                
                {step === 3 && (
                  <div className="text-center">
                    <div className="p-6 bg-white rounded-lg shadow-md mb-4 flex flex-col items-center">
                      <div className="flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Verification Successful</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Your identity has been verified
                      </p>
                    </div>
                    <p className="text-sm text-gray-700">
                      Redirecting to your dashboard...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative flex-1 hidden w-0 lg:block">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 flex flex-col justify-center items-center">
          <div className="max-w-md px-8 text-center">
            <h2 className="text-4xl font-bold text-white">Heirloom Identity Platform</h2>
            <p className="mt-4 text-lg text-white opacity-90">
              Secure verification using your device's native biometrics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};