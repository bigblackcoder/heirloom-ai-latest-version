import React from 'react';
import WebAuthnVerifier from '../components/WebAuthnVerifier';

export function WebAuthnTest() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Face ID Authentication Test</h1>
      <WebAuthnVerifier />
    </div>
  );
}

export default WebAuthnTest;