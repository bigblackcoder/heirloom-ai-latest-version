# Heirloom Identity Platform Server Setup Guide

## Overview

This guide provides instructions for setting up the Heirloom Identity Platform server component on a custom backend. The server provides a RESTful API for identity verification, face recognition, and AI service connections.

## System Requirements

- Node.js v18.0.0 or later
- Python 3.9 or later (for face verification)
- PostgreSQL database (recommended for production)
- 4GB RAM minimum (8GB+ recommended)
- 2 CPU cores minimum (4+ recommended)

## Configuration Options

### Environment Variables

Create a `.env` file in the root directory with these essential configuration options:

```
# Server configuration
PORT=5000
NODE_ENV=production

# Database configuration
DATABASE_URL=postgresql://username:password@localhost:5432/heirloom

# Session configuration
SESSION_SECRET=your-session-secret

# Face verification settings
FACE_VERIFICATION_CONFIDENCE_THRESHOLD=85
FACE_DB_PATH=./face_db
USE_LIGHTWEIGHT_DETECTION=false
```

### Directory Structure

The server requires these key directories:

```
/server             - API routes and core logic
  /routes.ts        - API endpoint definitions
  /storage.ts       - Data storage interface
  /deepface.ts      - Face verification integration
  /lightweight_face.py - Lightweight face detection
  /face_verification.py - DeepFace integration
/shared             - Shared data schemas
/face_db            - Face database storage
  /templates        - Where face templates are stored
```

## Database Setup

### PostgreSQL (Recommended for Production)

1. **Create a PostgreSQL database**:
   ```sql
   CREATE DATABASE heirloom;
   ```

2. **Run migrations using your ORM tool**

### In-Memory Storage (Development/Testing)

The server includes an in-memory storage option for development or quick testing:

1. **Set storage mode to in-memory**:
   ```
   STORAGE_MODE=memory
   ```

## Face Verification Setup

The face verification system requires specific setup:

1. **Create face database directory**:
   ```bash
   mkdir -p face_db/templates
   ```

2. **Ensure Python dependencies are available**:
   Required packages: `deepface`, `numpy`, `opencv-python-headless`, `tensorflow`

3. **Test face verification**:
   ```bash
   python server/test_face_verification.py
   ```

### Lightweight Face Detection

For environments where DeepFace is too resource-intensive:

1. **Enable lightweight detection mode**:
   ```
   USE_LIGHTWEIGHT_DETECTION=true
   ```

2. **Adjust confidence threshold**:
   ```
   FACE_VERIFICATION_CONFIDENCE_THRESHOLD=65
   ```

## API Security Configuration

### CORS Configuration

```javascript
// In server/index.ts
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

### Rate Limiting

```javascript
// In server/index.ts
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', apiLimiter);
```

### HTTP Security Headers

```javascript
// In server/index.ts
import helmet from 'helmet';

app.use(helmet());
```

## Session Management

### Cookie-Based Sessions

```javascript
// In server/index.ts
import session from 'express-session';
import pgSession from 'connect-pg-simple';

const PgStore = pgSession(session);

app.use(session({
  store: new PgStore({
    conString: process.env.DATABASE_URL,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
}));
```

### JWT Authentication Alternative

```javascript
// In server/middlewares/jwt.ts
import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.session = { userId: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
```

## Performance Optimization

### Node.js Memory Configuration

```bash
export NODE_OPTIONS=--max-old-space-size=4096
```

### Multi-Core Processing

```javascript
// In server/index.ts
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Workers can share any TCP connection
  // In this case, it is an HTTP server
  startServer();
}
```

### Face Verification Performance Tips

- Use a dedicated worker thread for face processing
- Implement caching for frequently accessed face templates
- Use the lightweight detection mode for faster response times
- Process images at a reasonable resolution (640x480 is often sufficient)

## Deployment Considerations

### Docker Configuration Example

Dockerfile should include:
- Node.js runtime
- Python runtime with required libraries
- Configuration for face database directory
- Proper environment settings

### Cloud Provider Configurations

#### AWS Elastic Beanstalk

Create a `Procfile`:
```
web: node dist/server/index.js
```

#### Google Cloud Run

```bash
gcloud run deploy heirloom-server --image [YOUR-IMAGE] --platform managed
```

## Monitoring and Logging

### Structured Logging

```javascript
// In server/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Also log to console in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### Health Check Endpoint

```javascript
// In server/routes.ts
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});
```

## Troubleshooting Common Issues

### Face Verification Errors

- Ensure Python environment is properly configured
- Check face database directory permissions
- Verify image format and quality (JPEG recommended)
- Test with `server/test_basic_verify.py` to isolate Python vs. JavaScript issues

### Database Connection Issues

- Verify DATABASE_URL format and credentials
- Check network connectivity to database server
- Ensure PostgreSQL service is running and accessible

### Session Management Issues

- Verify SESSION_SECRET is set and consistent
- Check cookie settings for secure environments
- Ensure session table exists in database

## Further Reading

For complete API details, refer to:
- `docs/API.md` - General API documentation
- `docs/FACE_VERIFICATION_API.md` - Face verification specifics
- `docs/AI_CONNECTION_API.md` - AI service connections
