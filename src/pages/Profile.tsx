import React, { useState, useEffect } from 'react';
import { useNavigate } from 'wouter';
import { BlockchainBiometricAuth } from '../components/blockchain-biometric-auth';

interface UserProfile {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isVerified: boolean;
}

export function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [biometricTab, setBiometricTab] = useState<'register' | 'verify'>('verify');
  const navigate = useNavigate();

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated, redirect to login
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch user profile');
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching user profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [navigate]);

  // Handle biometric authentication success
  const handleBiometricSuccess = (result: { userId: number; verified: boolean }) => {
    if (biometricTab === 'register') {
      alert('Biometric registration successful! You can now use your device biometric for authentication.');
    } else {
      alert('Identity verified successfully using your device biometric!');
    }
  };

  // Handle biometric authentication error
  const handleBiometricError = (errorMsg: string) => {
    setError(errorMsg);
    setTimeout(() => setError(null), 5000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="ml-2">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">⚠</div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User info card */}
            <div className="md:col-span-1">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-primary/10 p-6 flex justify-center">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username} 
                      className="h-32 w-32 rounded-full object-cover border-4 border-white"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-primary/20 flex items-center justify-center text-4xl text-primary">
                      {user.firstName?.[0] || user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-1">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.username
                    }
                  </h2>
                  
                  {user.isVerified && (
                    <div className="flex items-center text-green-600 text-sm font-medium mb-4">
                      <span className="mr-1">✓</span>
                      Verified Identity
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Username:</span> {user.username}
                    </div>
                    {user.email && (
                      <div>
                        <span className="text-gray-500">Email:</span> {user.email}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className="mt-6 w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    onClick={() => {
                      // Log out functionality
                      fetch('/api/auth/logout', { method: 'POST' })
                        .then(() => navigate('/'));
                    }}
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
            
            {/* Biometric authentication card */}
            <div className="md:col-span-2">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="border-b p-4">
                  <div className="flex text-sm">
                    <button
                      className={`px-4 py-2 rounded-md font-medium ${
                        biometricTab === 'verify'
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setBiometricTab('verify')}
                    >
                      Verify Identity
                    </button>
                    <button
                      className={`ml-2 px-4 py-2 rounded-md font-medium ${
                        biometricTab === 'register'
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setBiometricTab('register')}
                    >
                      Register New Device
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {biometricTab === 'register' 
                      ? 'Register Device Biometric'
                      : 'Verify With Biometric'
                    }
                  </h2>
                  
                  <p className="text-gray-600 mb-6">
                    {biometricTab === 'register'
                      ? 'Register your device biometric for seamless authentication. Your biometric data never leaves your device.'
                      : 'Verify your identity using your device biometric. Quick, secure, and private.'
                    }
                  </p>
                  
                  <BlockchainBiometricAuth
                    userId={user.id}
                    mode={biometricTab}
                    onSuccess={handleBiometricSuccess}
                    onError={handleBiometricError}
                  />
                  
                  <div className="mt-6 bg-blue-50 p-4 rounded-md">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">How Device Biometrics Work</h3>
                    <p className="text-sm text-blue-700">
                      Our system keeps your biometric data on your device for maximum security.
                      Only verification metadata is stored in our system, ensuring your privacy
                      while providing seamless authentication.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}