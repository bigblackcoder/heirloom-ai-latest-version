# Heirloom Identity Platform

An advanced identity verification platform leveraging cutting-edge AI and user-centric design to provide secure, intelligent authentication solutions with a focus on user experience and privacy.

## Key Features

- AI-powered face verification services
- DeepFace and OpenCV for advanced biometric verification
- Secure credential management
- Privacy-focused design
- Cross-platform compatibility

## Technology Stack

- React for frontend development
- TypeScript for robust, type-safe code
- Express backend for API services
- Tailwind CSS for responsive design
- Framer Motion for UI animations

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- PostgreSQL database
- Python 3.11+ (for face verification services)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables following the `.env.example` template
4. Start the development server:
   ```bash
   npm run dev
   ```

## Security

We take security seriously. Please review our security documentation:

- [Security Best Practices](./docs/SECURITY.md)
- [Secure SVG Creation Guide](./docs/SECURE_SVG_GUIDE.md)

### Running Security Checks

To scan the codebase for potential credential leaks:

```bash
./scripts/scan-credentials.sh
```

This enhanced scanning tool checks for:
- Credentials in code files
- AWS access tokens in binary and image files
- Base64-encoded data that might contain sensitive information

## Contributing

Please ensure you follow our contribution guidelines:

1. Create a feature branch from `develop`
2. Ensure code passes all linting and security checks
3. Submit a pull request with comprehensive descriptions
4. Follow our security best practices

## License

This project is proprietary and confidential. All rights reserved.