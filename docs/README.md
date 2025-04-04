# Heirloom Identity Platform Documentation

Welcome to the Heirloom Identity Platform documentation. This suite of documentation provides comprehensive guides for integrating with and deploying the Heirloom Identity Platform.

## Available Documentation

### Core API Documentation

- [**API Reference**](API.md) - Complete reference documentation for all available API endpoints
- [**Face Verification API Guide**](FACE_VERIFICATION_API.md) - Detailed guide for implementing face verification
- [**AI Connection API Guide**](AI_CONNECTION_API.md) - Guide for integrating with AI service connections

### Implementation Guides

- [**Server Setup**](SERVER_SETUP.md) - Guide for deploying and configuring the API server
- [**Mobile Integration**](MOBILE_INTEGRATION.md) - Guide for integrating with React Native mobile applications

## Quick Start

For new integrations, we recommend starting with these steps:

1. Review the **API Reference** to understand available endpoints
2. Set up the server following the **Server Setup** guide
3. Begin implementing client features using the appropriate guide:
   - For web clients: Use API reference directly
   - For mobile apps: Follow the **Mobile Integration** guide

## Core Features

The Heirloom Identity Platform provides these key features:

### Identity Verification
- Face-based biometric verification
- Multiple verification modes (standard/lightweight)
- Face template storage and matching

### Identity Capsules
- Secure storage of verified user attributes
- Selective attribute disclosure
- Credential issuance and management

### AI Service Connections
- Connect verified identities to AI services
- Granular consent-based data sharing
- Connection revocation

## Implementation Architecture

### Server-Side Architecture
The server component is built on Express.js with PostgreSQL storage, providing:

- RESTful API endpoints
- Face verification processing
- Data storage and retrieval

### Client Options
Multiple client implementation options:

- Web SDK (React-based reference implementation)
- Mobile SDK (React Native)
- Direct API integration

## Support

For additional support:

- GitHub issues: [https://github.com/your-org/heirloom-identity-platform/issues](https://github.com/your-org/heirloom-identity-platform/issues)
- Email support: support@example.com
