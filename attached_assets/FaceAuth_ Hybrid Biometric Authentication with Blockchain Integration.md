# FaceAuth: Hybrid Biometric Authentication with Blockchain Integration

## Project Overview
This project implements a secure hybrid authentication system that integrates:
- Facial recognition using deepface
- Third-party biometric verification (Apple FaceID and Google Biometric)
- Blockchain-based identity storage on Polygon testnet
- Local secure identity storage

The system provides multiple authentication methods (face, fingerprint, and password) with facial recognition as the primary method, while ensuring user data remains under their control through blockchain-based access management.

## Features

### Authentication Methods
- **Facial Recognition**: Primary authentication using deepface integration
- **Fingerprint Authentication**: Secondary biometric option
- **Username/Password**: Fallback authentication method

### Blockchain Integration
- **Identity Verification**: Stores authentication events on Polygon testnet
- **Verification History**: Tracks all authentication attempts with timestamps
- **Access Control**: Allows users to grant and revoke access to their identity data

### Security Features
- **Local Storage**: Identity data stored locally, controlled by the user
- **Hybrid Approach**: Combines on-device biometrics with blockchain verification
- **Cross-Platform**: Works on both web and mobile platforms

## Technical Implementation

### Frontend
- React with TypeScript for type safety
- Responsive design for both web and mobile
- Accessibility features following WCAG guidelines

### Authentication
- deepface for facial recognition
- Web Authentication API for fingerprint and device biometrics
- Secure credential management

### Blockchain
- Smart contract on Polygon testnet for identity verification
- Ethers.js for blockchain interaction
- MetaMask integration for wallet connection

## Getting Started

### Prerequisites
- Node.js and npm/pnpm
- MetaMask extension or compatible Web3 wallet
- Camera access for facial recognition
- Fingerprint sensor (optional)

### Installation
1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Start the development server:
   ```
   pnpm run dev
   ```

### Smart Contract Deployment
The smart contract (`IdentityVerification.sol`) needs to be deployed to Polygon Mumbai testnet:

1. Use Remix or Hardhat to compile and deploy
2. Update the contract address in `IdentityContract.ts`
3. Ensure your wallet has MATIC tokens for the Mumbai testnet

## Usage Flow

1. **Initial Authentication**:
   - User opens the application
   - Facial recognition scan is initiated
   - User follows on-screen instructions to complete facial scan
   - Authentication result is stored on blockchain

2. **Secondary Authentication**:
   - If facial recognition fails or is unavailable, user can select fingerprint or password
   - Authentication result is still recorded on blockchain

3. **Blockchain Verification**:
   - All authentication attempts are recorded on Polygon testnet
   - User can view their verification history
   - User can control who has access to their identity data

## Security Considerations

- All biometric data is processed locally and never sent to external servers
- Only verification results (not actual biometric data) are stored on blockchain
- Smart contract includes access control mechanisms
- Local storage is encrypted for additional security

## Future Enhancements

- Multi-factor authentication combining multiple biometric methods
- Integration with decentralized identity standards (DID)
- Enhanced privacy features using zero-knowledge proofs
- Support for additional biometric methods

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- deepface library for facial recognition capabilities
- Polygon for providing testnet infrastructure
- Web3 and Ethereum community for blockchain tools and resources
