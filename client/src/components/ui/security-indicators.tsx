import { useState, useEffect } from "react";
import { Shield, Lock, CheckCircle, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityIndicatorsProps {
  className?: string;
  variant?: "default" | "compact";
}

export function SecurityIndicators({ className, variant = "default" }: SecurityIndicatorsProps) {
  const [biometricStatus, setBiometricStatus] = useState<"active" | "inactive" | "checking">("checking");
  const [encryptionLevel, setEncryptionLevel] = useState<"high" | "medium" | "low">("high");
  const [heirloomVerified, setHeirloomVerified] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check biometric availability
    const checkBiometrics = async () => {
      try {
        if (typeof PublicKeyCredential !== 'undefined') {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricStatus(available ? "active" : "inactive");
        } else {
          setBiometricStatus("inactive");
        }
      } catch (error) {
        setBiometricStatus("inactive");
      }
    };

    checkBiometrics();

    // Simulate Heirloom verification after a short delay
    const timer = setTimeout(() => {
      setHeirloomVerified(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (variant === "compact") {
    return (
      <div 
        className={cn("relative cursor-pointer", className)}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-2">
          {/* Device Biometric Status */}
          <div className="relative">
            <div
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-200",
                biometricStatus === "active" && "bg-green-400 border-green-300 shadow-lg shadow-green-400/30",
                biometricStatus === "inactive" && "bg-gray-500 border-gray-400",
                biometricStatus === "checking" && "bg-yellow-400 border-yellow-300 animate-pulse"
              )}
            />
            {biometricStatus === "active" && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-300 rounded-full animate-ping opacity-75" />
            )}
          </div>

          {/* Encryption Level */}
          <div className="relative">
            <Lock className="w-4 h-4 text-green-400 drop-shadow-lg" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-300 rounded-full animate-pulse" />
          </div>

          {/* Heirloom Verification Badge */}
          <div className="relative">
            <Shield
              className={cn(
                "w-4 h-4 transition-all duration-200",
                heirloomVerified ? "text-green-400 drop-shadow-lg" : "text-gray-500"
              )}
            />
            {heirloomVerified && (
              <CheckCircle className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 text-green-300 animate-bounce" />
            )}
          </div>

          {/* Security Level Badge */}
          <div className="ml-1 px-2 py-0.5 bg-green-500/20 border border-green-400/30 rounded-full">
            <span className="text-green-300 text-xs font-medium">
              {heirloomVerified ? "SECURE" : "CHECKING"}
            </span>
          </div>
        </div>

        {/* Tooltip/Details Popup */}
        {showDetails && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-[#1a2e0c] border border-green-400/30 rounded-xl p-4 shadow-2xl z-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">Security Status</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-xs">ACTIVE</span>
                </div>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Biometric Auth</span>
                  <span className={cn(
                    "font-medium",
                    biometricStatus === "active" ? "text-green-400" : "text-gray-400"
                  )}>
                    {biometricStatus === "active" ? "Available" : "Unavailable"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Encryption</span>
                  <span className="text-green-400 font-medium">AES-256</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Heirloom Verified</span>
                  <span className={cn(
                    "font-medium",
                    heirloomVerified ? "text-green-400" : "text-yellow-400"
                  )}>
                    {heirloomVerified ? "Yes" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Device Biometric Status */}
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <div
            className={cn(
              "w-4 h-4 rounded-full border-2",
              biometricStatus === "active" && "bg-green-400 border-green-300",
              biometricStatus === "inactive" && "bg-gray-500 border-gray-400",
              biometricStatus === "checking" && "bg-yellow-400 border-yellow-300 animate-pulse"
            )}
          />
          {biometricStatus === "active" && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-300 rounded-full animate-ping opacity-75" />
          )}
        </div>
        <span className="text-xs text-white/80 hidden sm:inline">
          {biometricStatus === "active" && "Biometric"}
          {biometricStatus === "inactive" && "Device"}
          {biometricStatus === "checking" && "Checking"}
        </span>
      </div>

      {/* Encryption Level Indicator */}
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <Lock className="w-4 h-4 text-green-400" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-300 rounded-full" />
        </div>
        <span className="text-xs text-white/80 hidden sm:inline">AES</span>
      </div>

      {/* Heirloom Verification Badge */}
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <Shield
            className={cn(
              "w-4 h-4",
              heirloomVerified ? "text-green-400" : "text-gray-500"
            )}
          />
          {heirloomVerified && (
            <CheckCircle className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 text-green-300" />
          )}
        </div>
        <span
          className={cn(
            "text-xs hidden sm:inline",
            heirloomVerified ? "text-white/80" : "text-white/50"
          )}
        >
          {heirloomVerified ? "Verified" : "Pending"}
        </span>
      </div>
    </div>
  );
}

// Individual indicator components for more granular control
export function BiometricIndicator({ className }: { className?: string }) {
  const [status, setStatus] = useState<"active" | "inactive" | "checking">("checking");

  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        if (typeof PublicKeyCredential !== 'undefined') {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setStatus(available ? "active" : "inactive");
        } else {
          setStatus("inactive");
        }
      } catch (error) {
        setStatus("inactive");
      }
    };

    checkBiometrics();
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "w-4 h-4 rounded-full",
          status === "active" && "bg-green-400",
          status === "inactive" && "bg-gray-500",
          status === "checking" && "bg-yellow-400 animate-pulse"
        )}
      />
      {status === "active" && (
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-300 rounded-full animate-ping" />
      )}
    </div>
  );
}

export function EncryptionIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Lock className="w-4 h-4 text-green-400" />
      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-300 rounded-full" />
    </div>
  );
}

export function HeirloomBadge({ className }: { className?: string }) {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVerified(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Shield
        className={cn(
          "w-4 h-4",
          verified ? "text-green-400" : "text-gray-500"
        )}
      />
      {verified && (
        <CheckCircle className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 text-green-300" />
      )}
    </div>
  );
}