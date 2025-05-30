# Heirloom AI Identity Platform

A comprehensive identity verification platform that combines biometric authentication, blockchain integration, and AI service connections for secure digital identity management.

## 🚀 Features

- **Biometric Authentication**: Face verification using DeepFace technology
- **WebAuthn Support**: Device-based biometric authentication
- **AI Service Integration**: Connect with OpenAI, Anthropic Claude, Google Gemini, and more
- **Identity Capsules**: Secure containers for verified personal data
- **Achievement System**: Gamified identity verification milestones
- **Real-time Dashboard**: Live activity monitoring and security alerts

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for fast development and building

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Drizzle ORM with type-safe queries
- **Authentication**: Session-based with bcrypt password hashing
- **File Handling**: Express file upload middleware

### AI & Verification Services
- **Face Verification**: Python-based DeepFace service on port 8000
- **Biometric Storage**: Local face database with embeddings
- **Identity Verification**: Hybrid verification system

## 🛠️ Tech Stack

### Core Dependencies
```json
{
  "frontend": {
    "react": "^18.3.1",
    "typescript": "5.6.3",
    "vite": "^6.3.5",
    "tailwindcss": "^3.4.14",
    "@tanstack/react-query": "^5.60.5"
  },
  "backend": {
    "express": "^4.21.2",
    "drizzle-orm": "^0.39.1",
    "better-sqlite3": "^11.10.0",
    "bcryptjs": "^3.0.2",
    "express-session": "^1.18.1"
  },
  "ai_services": {
    "@anthropic-ai/sdk": "^0.37.0",
    "openai": "^4.96.0",
    "deepface": "python-package"
  }
}
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- Python 3.8+ (for face verification service)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/bigblackcoder/heirloom-ai-latest-version.git
cd heirloom-ai-latest-version
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

4. **Configure your environment** (edit `.env.local`):
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database (SQLite for development)
DATABASE_URL=file:./dev.db

# Session Security
SESSION_SECRET=your-secure-session-secret

# Face Verification
FACE_VERIFICATION_CONFIDENCE_THRESHOLD=85
FACE_DB_PATH=./face_db
VERIFICATION_SERVICE_URL=http://localhost:8000

# Optional: AI Service API Keys
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

5. **Initialize the database**
```bash
npm run db:push
```

6. **Start the development servers**

**Backend** (Terminal 1):
```bash
npm run dev
```

**Frontend** (Terminal 2):
```bash
cd client && npm run dev
```

**Face Verification Service** (Terminal 3):
```bash
cd verification_service && python main.py
```

## 🌐 API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Face Verification
- `POST /api/verification/face` - Face verification with image
- `POST /api/verification/face/basic` - Basic face detection

### Identity Management
- `GET /api/capsules` - Get user's identity capsules
- `POST /api/capsules` - Create new identity capsule
- `GET /api/verified-data/:capsuleId` - Get verified data

### AI Connections
- `GET /api/ai-connections` - Get user's AI service connections
- `POST /api/ai-connections` - Create new AI connection
- `PUT /api/ai-connections/:id` - Update AI connection

## 🔐 Security Features

### Authentication & Authorization
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Session Management**: Secure session storage with expiration
- **CORS Protection**: Configured for allowed origins only
- **Input Validation**: Comprehensive request validation

### Biometric Security
- **Face Verification**: DeepFace-powered facial recognition
- **Confidence Thresholds**: Adjustable verification confidence levels
- **Encrypted Storage**: Secure face embedding storage
- **Privacy Controls**: User-controlled biometric data management

### Data Protection
- **Database Security**: Parameterized queries prevent SQL injection
- **File Upload Security**: Size limits and type validation
- **Environment Isolation**: Separate configs for development/production

## 📊 Database Schema

### Core Tables
- **users**: User accounts and profiles
- **identity_capsules**: Containers for verified data
- **verified_data**: Encrypted personal information
- **face_records**: Biometric verification records
- **ai_connections**: AI service integrations
- **activities**: User action audit log
- **achievements**: Verification milestones

## 🎯 Current Status

### ✅ Completed Features
- [x] Backend server running on port 5001
- [x] SQLite database configured and connected
- [x] User registration and authentication
- [x] Face verification service integration
- [x] Frontend React application
- [x] Security vulnerability fixes
- [x] API endpoint testing

### 🚧 In Development
- [ ] Email verification system
- [ ] OAuth integration for AI services
- [ ] Advanced biometric features
- [ ] Blockchain integration
- [ ] Mobile app companion

## 🔧 Development

### Project Structure
```
heirloom-ai-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and helpers
├── server/                # Express backend
│   ├── routes/           # API route handlers
│   ├── middleware/       # Express middleware
│   └── utils/            # Backend utilities
├── shared/               # Shared TypeScript types
├── verification_service/ # Python face verification
├── contracts/           # Smart contracts
└── docs/               # Documentation
```

### Running Tests
```bash
# Backend tests
npm test

# Frontend tests
cd client && npm test

# Integration tests
npm run test:integration
```

### Building for Production
```bash
npm run build
```

## 📝 License

This project is private and proprietary. All rights reserved.

## 👥 Contributing

This is a private repository. Contact the repository owner for access and contribution guidelines.

## 📞 Support

For support and questions, please contact the development team through the repository's issue tracker.

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**

Co-Authored-By: Claude <noreply@anthropic.com>