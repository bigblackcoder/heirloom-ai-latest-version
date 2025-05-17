import React, { useState } from 'react';
import WebAuthnVerifier from '../components/WebAuthnVerifier';

export function WebAuthnTest() {
  // In a real app, these values would come from authentication context
  // For demo purposes, we're using a mock user
  const [userId] = useState('1234');
  const [username] = useState('demoaccount');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Face ID Authentication Test</h1>
      <p className="text-center mb-4 text-gray-600">Testing biometric authentication with user: {username}</p>
      <WebAuthnVerifier userId={userId} username={username} />
    </div>
  );
}

export default WebAuthnTest;