# Heirloom AI Setup Guide

This guide will help you set up the Heirloom AI Identity Platform on your local machine.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18 or higher
- Python 3.8 or higher  
- Git

### 2. Clone and Install
```bash
git clone https://github.com/bigblackcoder/heirloom-ai-latest-version.git
cd heirloom-ai-latest-version
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local` with your settings:
```env
PORT=5001
NODE_ENV=development
DATABASE_URL=file:./dev.db
SESSION_SECRET=your-secure-random-string-here
FACE_VERIFICATION_CONFIDENCE_THRESHOLD=85
```

### 4. Initialize Database
```bash
npm run db:push
```

### 5. Start Services

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client && npm run dev
```

**Terminal 3 - Face Verification Service:**
```bash
cd verification_service
python -m pip install -r requirements.txt
python main.py
```

## 🌐 Access Points

- **Frontend**: http://localhost:4000
- **Backend API**: http://localhost:5001
- **Face Verification**: http://localhost:8000

## 🔧 Development

### Available Scripts
- `npm run dev` - Start backend development server
- `npm run build` - Build for production
- `npm run db:push` - Update database schema
- `npm test` - Run tests

### Project Structure
```
├── client/          # React frontend
├── server/          # Express backend  
├── shared/          # Shared TypeScript types
├── verification_service/  # Python face verification
└── docs/           # Documentation
```

## 🐛 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check what's using ports
lsof -i :5001
lsof -i :4000
lsof -i :8000

# Kill processes if needed
kill -9 <PID>
```

**Database issues:**
```bash
# Reset database
rm dev.db
npm run db:push
```

**Python dependencies:**
```bash
cd verification_service
pip install -r requirements.txt
```

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Database**: SQLite file is created automatically
3. **Logs**: Check console output for debugging
4. **API Testing**: Use the health endpoint `/api/health`

## 📝 Next Steps

1. Register a new user account
2. Test face verification
3. Explore the dashboard
4. Connect AI services
5. Review the documentation

## 🔐 Security Notes

- Never commit `.env.local` to version control
- Use strong session secrets in production
- Face data is stored locally for privacy
- All passwords are bcrypt hashed

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review logs in the terminal
3. Create an issue in the repository