import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FaceScanner from "@/components/face-scanner";
import { motion } from "framer-motion";
import { HeirloomLogo } from "@/components/heirloom-logo";

interface BiometricVerificationProps {
  onProgress: (progress: number) => void;
  onComplete: (method: VerificationMethod) => void;
  isComplete: boolean;
}

export type VerificationMethod = "face" | "fingerprint" | "voice";

export default function BiometricVerification({ 
  onProgress, 
  onComplete, 
  isComplete 
}: BiometricVerificationProps) {
  const [activeMethod, setActiveMethod] = useState<VerificationMethod>("face");
  
  const handleMethodChange = (method: VerificationMethod) => {
    if (isComplete) return; // Don't allow changes if verification is complete
    setActiveMethod(method);
    onProgress(0); // Reset progress when changing methods
  };
  
  const handleComplete = () => {
    onComplete(activeMethod);
  };
  
  // Calculate the progress offset - convert callback to current progress
  const calculateOffset = (currentProgress: number | ((progress: number) => void)): number => {
    // If it's a callback, we're in an animation, use current stored progress
    if (typeof currentProgress === 'function') {
      return isComplete ? 0 : 892 * (1 - (verificationProgress / 100));
    }
    // Otherwise it's the actual progress number
    return isComplete ? 0 : 892 * (1 - (currentProgress / 100));
  };
  
  // Keep track of verification progress locally
  const [verificationProgress, setVerificationProgress] = useState(0);
  
  // Update local progress when parent progress changes
  const handleProgressUpdate = (progress: number) => {
    setVerificationProgress(progress);
    onProgress(progress);
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs 
        defaultValue="face" 
        className="w-full" 
        onValueChange={(value) => handleMethodChange(value as VerificationMethod)}
        value={activeMethod}
      >
        <TabsList className="grid grid-cols-3 mb-8 bg-white/10 backdrop-blur-sm">
          <TabsTrigger value="face" disabled={isComplete} className="data-[state=active]:bg-[#4caf50] data-[state=active]:text-white">
            <div className="flex flex-col items-center">
              <svg className="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />
                <path d="M8 9v.01" />
                <path d="M16 9v.01" />
                <path d="M8 13h8" />
                <path d="M12 16a4 4 0 0 0 4-4" />
              </svg>
              Face
            </div>
          </TabsTrigger>
          <TabsTrigger value="fingerprint" disabled={isComplete} className="data-[state=active]:bg-[#4caf50] data-[state=active]:text-white">
            <div className="flex flex-col items-center">
              <svg className="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8V7c0-2.8 2.2-5 5-5h2c2.8 0 5 2.2 5 5v1" />
                <path d="M15 13V9h1c.6 0 1 .4 1 1v0c0 .6-.4 1-1 1h-1" />
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              </svg>
              Print
            </div>
          </TabsTrigger>
          <TabsTrigger value="voice" disabled={isComplete} className="data-[state=active]:bg-[#4caf50] data-[state=active]:text-white">
            <div className="flex flex-col items-center">
              <svg className="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 18v-6" />
                <path d="M8 15h8" />
                <path d="M12 8a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0v-1a3 3 0 0 0-3-3Z" />
                <path d="M17 16.5a9 9 0 1 0-10 0" />
              </svg>
              Voice
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="face" className="flex flex-col items-center justify-center mt-0">
          <FaceScanner
            onProgress={handleProgressUpdate}
            onComplete={handleComplete}
            isComplete={isComplete}
          />
        </TabsContent>
        
        <TabsContent value="fingerprint" className="flex flex-col items-center justify-center h-72 mt-0">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Fingerprint scan animation */}
            <div className="w-48 h-48 rounded-full border-2 border-white/30 flex items-center justify-center bg-[#143404]/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4caf50]/10 to-transparent animate-scan" />
              
              {isComplete ? (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-[#4caf50]/20 w-32 h-32 rounded-full flex items-center justify-center"
                >
                  <svg className="w-16 h-16 text-[#4caf50]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </motion.div>
              ) : (
                <svg className="w-32 h-32 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M17 8C17 9.5913 16.5786 11.1174 15.8284 12.4229C15.0783 13.7285 14.0387 14.7611 12.7807 15.3901C11.5226 16.0192 10.0909 16.2163 8.6953 15.9537C7.29976 15.6911 6.01224 14.9813 5 13.9" />
                  <path d="M16 6C14.1617 4.16175 11.6583 3 9 3C6.34174 3 3.8383 4.16175 2 6" />
                  <path d="M14 4C11.7909 2.79086 9.20914 2.79086 7 4" />
                  <path d="M12 19C11.1808 19.8192 10.0461 20.3447 8.85173 20.4576C7.65732 20.5705 6.45076 20.2644 5.45455 19.5902C4.45834 18.9159 3.72857 17.9157 3.39368 16.7524C3.05878 15.589 3.13727 14.3463 3.613 13.232C4.08873 12.1177 4.92989 11.1927 6 10.5915" />
                  <path d="M10 18C8.84062 18.3513 7.58593 18.2242 6.52953 17.6553C5.47313 17.0864 4.69849 16.123 4.37017 14.9783C4.04186 13.8335 4.18534 12.6016 4.76878 11.5551C5.35221 10.5086 6.32622 9.7358 7.47466 9.40845C8.6231 9.08111 9.8566 9.22315 10.9056 9.80556" />
                  <path d="M15 9C14.312 10.4131 13.1211 11.5337 11.6531 12.1457C10.1851 12.7577 8.5367 12.8184 7.02739 12.3146C5.51808 11.8108 4.24403 10.7779 3.46763 9.39375C2.69123 8.00959 2.46959 6.37921 2.84831 4.86091C3.22702 3.34262 4.17723 2.03763 5.50015 1.219C6.82307 0.400359 8.41402 0.119159 9.94284 0.433378C11.4717 0.747596 12.8131 1.63585 13.7203 2.9155C14.6275 4.19514 15.0358 5.78185 14.86 7.359" />
                  <path d="M17 11C16.2953 12.4549 15.0648 13.5841 13.5615 14.1293C12.0582 14.6744 10.3985 14.5947 8.95927 13.91C7.52005 13.2254 6.41533 11.9931 5.86036 10.4878C5.3054 8.98257 5.34272 7.32671 5.96683 5.84744C6.59094 4.36816 7.75235 3.20148 9.22877 2.56954C10.7052 1.9376 12.3596 1.96628 13.8375 2.58293C15.3154 3.19958 16.4491 4.35461 17.0412 5.82656C17.6333 7.29852 17.639 8.95293 17.058 10.43" />
                  <path d="M11 12C10.4987 12.332 9.8825 12.4772 9.26799 12.3989C8.65348 12.3207 8.0918 12.0244 7.67914 11.5669C7.26648 11.1094 7.03247 10.5203 7.02143 9.90334C7.0104 9.28634 7.22308 8.68813 7.62 8.215" />
                  <path d="M13 14C11.3113 14.8531 9.3268 14.8535 7.6376 14.0009C5.9484 13.1484 4.73296 11.5301 4.37873 9.64221C4.02451 7.75431 4.57263 5.8272 5.87309 4.40806C7.17355 2.98891 9.0696 2.24838 11 2.35" />
                </svg>
              )}
            </div>
            
            {/* Progress circle */}
            <svg className="absolute inset-0 w-full h-full z-20" viewBox="0 0 290 290">
              <motion.circle
                className="text-[#4caf50]"
                strokeWidth="2"
                stroke="currentColor"
                fill="transparent"
                r="142"
                cx="145"
                cy="145"
                strokeDasharray="892"
                initial={{ strokeDashoffset: 892 }}
                animate={{ 
                  strokeDashoffset: calculateOffset(onProgress)
                }}
                transition={{ 
                  duration: 0.5,
                  ease: "easeInOut"
                }}
              />
            </svg>
          </div>
        </TabsContent>
        
        <TabsContent value="voice" className="flex flex-col items-center justify-center h-72 mt-0">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Voice recognition animation */}
            <div className="w-48 h-48 rounded-full border-2 border-white/30 flex items-center justify-center bg-[#143404]/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4caf50]/10 to-transparent animate-scan" />
              
              {isComplete ? (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-[#4caf50]/20 w-32 h-32 rounded-full flex items-center justify-center"
                >
                  <svg className="w-16 h-16 text-[#4caf50]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center flex-col">
                  <div className="flex space-x-1 mb-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-[#4caf50]"
                        initial={{ height: 3 }}
                        animate={{ height: [3, 10 + i * 3, 3] }}
                        transition={{
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: 1,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#4caf50]/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM3.5 14v-4a4 4 0 0 1 4-4h5" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            
            {/* Progress circle */}
            <svg className="absolute inset-0 w-full h-full z-20" viewBox="0 0 290 290">
              <motion.circle
                className="text-[#4caf50]"
                strokeWidth="2"
                stroke="currentColor"
                fill="transparent"
                r="142"
                cx="145"
                cy="145"
                strokeDasharray="892"
                initial={{ strokeDashoffset: 892 }}
                animate={{ 
                  strokeDashoffset: calculateOffset(onProgress)
                }}
                transition={{ 
                  duration: 0.5,
                  ease: "easeInOut"
                }}
              />
            </svg>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Verification info card - Different for each method */}
      <div className="w-full max-w-xs mx-auto bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 mt-6">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-[#2a5414] rounded-full flex items-center justify-center mr-3">
            <HeirloomLogo className="w-4 h-4 text-[#4caf50]" />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">
              {activeMethod === "face" && "Secure Face Scan"}
              {activeMethod === "fingerprint" && "Fingerprint Verification"}
              {activeMethod === "voice" && "Voice Recognition"}
            </h3>
            <p className="text-white/60 text-xs">All data stays on your device</p>
          </div>
        </div>
        
        <p className="text-white/80 text-xs leading-relaxed">
          {activeMethod === "face" && "This scan verifies you're a real person and creates your secure identity record. Data is never stored on our servers."}
          {activeMethod === "fingerprint" && "Place your finger on your device's fingerprint reader to confirm your identity. Fingerprint data remains encrypted on your device."}
          {activeMethod === "voice" && "Say the verification phrase that appears on screen. Your unique voice pattern helps confirm your identity safely."}
        </p>
      </div>
    </div>
  );
}