/**
 * Shared WebAuthn type definitions used by both client and server
 */

/**
 * WebAuthn registration options to be sent to the client
 */
export interface WebAuthnRegistrationOptions {
  challenge: {
    data: number[];
  };
  rp: {
    name: string;
    id?: string;
  };
  user: {
    id: {
      data: number[];
    };
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  authenticatorSelection?: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    requireResidentKey?: boolean;
    residentKey?: 'required' | 'preferred' | 'discouraged';
    userVerification?: 'required' | 'preferred' | 'discouraged';
  };
  timeout?: number;
  excludeCredentials?: Array<{
    type: string;
    id: {
      data: number[];
    };
    transports?: string[];
  }>;
  attestation?: 'none' | 'indirect' | 'direct';
  extensions?: Record<string, any>;
}

/**
 * Registration response from the client to be verified by the server
 */
export interface WebAuthnRegistrationResponse {
  id: string;
  rawId: number[];
  response: {
    attestationObject: number[];
    clientDataJSON: string;
  };
  type: string;
  clientExtensionResults: Record<string, any>;
  authenticatorAttachment?: 'platform' | 'cross-platform';
}

/**
 * WebAuthn authentication options to be sent to the client
 */
export interface WebAuthnAuthenticationOptions {
  challenge: {
    data: number[];
  };
  timeout?: number;
  rpId?: string;
  allowCredentials?: Array<{
    type: string;
    id: {
      data: number[];
    };
    transports?: string[];
  }>;
  userVerification?: 'required' | 'preferred' | 'discouraged';
  extensions?: Record<string, any>;
}

/**
 * Authentication response from the client to be verified by the server
 */
export interface WebAuthnAuthenticationResponse {
  id: string;
  rawId: number[];
  response: {
    authenticatorData: number[];
    clientDataJSON: string;
    signature: number[];
    userHandle?: number[] | null;
  };
  type: string;
  clientExtensionResults: Record<string, any>;
}

/**
 * WebAuthn credential stored in the database
 */
export interface WebAuthnCredential {
  id: string;
  userId: number;
  publicKey: string;
  counter: number;
  transports?: string[];
  createdAt: Date;
  lastUsed?: Date | null;
  deviceInfo?: string | null;
}