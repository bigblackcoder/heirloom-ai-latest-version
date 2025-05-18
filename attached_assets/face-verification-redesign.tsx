import React, { useState, useEffect } from 'react';

const IdentityVerificationApp = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationMethod, setVerificationMethod] = useState('face');
  const [animateProgress, setAnimateProgress] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  
  useEffect(() => {
    // Simulate progress animation when step changes
    if (currentStep > 1) {
      setAnimateProgress(true);
      const interval = setInterval(() => {
        setProgressValue(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [currentStep]);
  
  const handleMethodChange = (method) => {
    setVerificationMethod(method);
  };
  
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-green-900 to-green-800 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-green-700 opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-green-600 opacity-10 translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-blue-700 opacity-5"></div>
      </div>
      
      {/* Header */}
      <div className="flex items-center p-4 bg-green-800 bg-opacity-70 backdrop-blur-md z-10">
        <button onClick={prevStep} className="p-2 rounded-full bg-green-700 bg-opacity-70 hover:bg-green-600 transition-all mr-4 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h1 className="text-xl font-medium text-center flex-1">Identity Verification</h1>
        <div className="w-10"></div>
      </div>
      
      {/* Method Selection */}
      <div className="mx-4 my-4 relative z-10">
        <div className="bg-green-800 bg-opacity-40 backdrop-blur-md p-1 rounded-2xl flex shadow-lg">
          <button 
            onClick={() => handleMethodChange('face')} 
            className={`flex items-center justify-center py-3 px-4 flex-1 rounded-xl transition-all duration-300 ${verificationMethod === 'face' 
              ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-inner text-white' 
              : 'bg-transparent text-green-200 hover:bg-green-700 hover:bg-opacity-30'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="8" cy="8" r="1"></circle>
              <circle cx="16" cy="8" r="1"></circle>
              <path d="M9 15a3 3 0 0 0 6 0"></path>
            </svg>
            Face Scan
          </button>
          <button 
            onClick={() => handleMethodChange('device')} 
            className={`flex items-center justify-center py-3 px-4 flex-1 rounded-xl transition-all duration-300 ${verificationMethod === 'device' 
              ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-inner text-white' 
              : 'bg-transparent text-green-200 hover:bg-green-700 hover:bg-opacity-30'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <rect x="4" y="2" width="16" height="20" rx="2"></rect>
              <circle cx="12" cy="18" r="2"></circle>
            </svg>
            Device Biometrics
          </button>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="relative z-10 mx-6 my-2">
        <div className="flex justify-between mb-1 text-sm font-medium">
          <span className="text-green-300">{currentStep === 1 ? 'Position your face' : currentStep === 2 ? 'Verify identity' : 'Processing'}</span>
          <span className="text-amber-300 font-bold">{animateProgress ? `${progressValue}%` : "0%"}</span>
        </div>
        <div className="w-full h-2 bg-green-800 bg-opacity-50 backdrop-blur-sm rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-amber-300 transition-all duration-300 ease-out" 
               style={{ width: animateProgress ? `${progressValue}%` : `${currentStep * 33}%` }}></div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        {verificationMethod === 'face' ? (
          <div className="flex flex-col items-center w-full">
            <div className="relative mb-6">
              <div className="w-64 h-64 rounded-3xl overflow-hidden flex items-center justify-center bg-black shadow-xl">
                {/* Camera frame with pulsing border effect */}
                <div className="absolute inset-0 rounded-3xl border-2 border-blue-400 animate-pulse"></div>
                <div className="absolute inset-0 rounded-3xl border border-blue-300 opacity-50"></div>
                
                {/* Inner frame with cutout shape */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-2 border-blue-400 bg-transparent"></div>
                </div>
                
                <div className="text-center z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-blue-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="mt-4 text-blue-300 font-medium">Camera access required</p>
                  <p className="text-sm mt-1 text-blue-200">Please allow camera access to verify your identity</p>
                </div>
              </div>
              
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-200 mr-2 animate-pulse"></div>
                  Finding face...
                </div>
              </div>
            </div>
            
            <div className="w-full max-w-md mt-6">
              <div className="bg-green-800 bg-opacity-30 backdrop-blur-md p-5 rounded-2xl mb-4 shadow-lg border border-green-700 border-opacity-30">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mr-4 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-green-100 font-medium">Make sure your face is clearly visible</p>
                    <p className="text-green-300 text-sm mt-1">Ensure good lighting and remove any obstructions</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mr-4 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-green-100 font-medium">Hold your device at eye level</p>
                    <p className="text-green-300 text-sm mt-1">Keep steady and follow the on-screen guidance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-64 h-64 rounded-3xl overflow-hidden flex items-center justify-center bg-green-800 bg-opacity-30 backdrop-blur-md shadow-xl border border-green-700 border-opacity-30">
              <div className="absolute inset-0 rounded-3xl border-2 border-blue-400 animate-pulse"></div>
              <div className="text-center p-4 z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-blue-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                <p className="mt-4 text-blue-300 font-medium">Use device biometrics</p>
                <p className="text-sm mt-1 text-blue-200">Touch ID or Face ID</p>
                <div className="mt-4 bg-green-700 bg-opacity-40 rounded-lg p-2">
                  <p className="text-green-200 text-sm">Secure and seamless verification using your device's built-in authentication</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Controls */}
      <div className="p-6 bg-green-800 bg-opacity-30 backdrop-blur-md border-t border-green-700 border-opacity-20 relative z-10">
        <div className="text-center mb-4">
          <div className="text-amber-300 text-5xl font-bold" style={{ textShadow: "0 2px 10px rgba(251, 191, 36, 0.3)" }}>
            {animateProgress ? `${progressValue}%` : "0%"}
          </div>
          <p className="text-green-100 mt-2 max-w-md mx-auto">
            Follow the guidance and move your head slowly to complete the verification.
          </p>
        </div>
        
        <button 
          onClick={nextStep} 
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-px"
        >
          {currentStep === 1 ? 'Continue with verification' : currentStep === 2 ? 'Submit verification' : 'Continue with Demo Mode'}
        </button>
        
        {currentStep === 1 && (
          <button className="w-full py-3.5 mt-3 border border-green-500 border-opacity-50 rounded-xl text-green-200 font-medium backdrop-blur-sm hover:bg-green-700 hover:bg-opacity-30 transition-all duration-300">
            Continue with Demo Mode
          </button>
        )}
      </div>
      
      {/* Progress Dots */}
      <div className="flex justify-center pb-6 relative z-10">
        {[1, 2, 3].map((step) => (
          <div key={step} className="mx-1 relative">
            <div 
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentStep === step 
                  ? 'bg-amber-300 shadow-md' 
                  : currentStep > step 
                    ? 'bg-green-400' 
                    : 'bg-green-700 bg-opacity-50'
              }`}
            />
            {currentStep === step && (
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-amber-300 animate-ping opacity-75"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IdentityVerificationApp;