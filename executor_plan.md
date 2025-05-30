# Heirloom AI App - Executor Plan

## Current State Summary
- **Frontend**: ✅ Running successfully on port 4000
- **Backend**: ❌ NOT running on port 5001 (critical blocker)
- **Database**: ❌ Not configured
- **Web Evaluation**: ✅ Completed - identified backend connectivity issues

## Immediate Executor Tasks

### Task 1.2: Check for missing dependencies and security vulnerabilities
1. Run `npm audit` to identify security vulnerabilities
2. Review and fix the 6 moderate severity vulnerabilities
3. Check for missing dependencies in package.json
4. Verify all required environment variables in .env.example

### Task 2.1: Fix Backend Server Startup (CRITICAL)
1. Check why the Express.js server isn't starting on port 5001
2. Review server/index.ts or server.ts for startup issues
3. Ensure DATABASE_URL is configured properly
4. Fix any TypeScript compilation errors
5. Get the server running with `npm run server` or equivalent

### Task 2.2: Verify API Endpoints
1. Once server is running, test authentication endpoints:
   - GET /api/auth/me
   - POST /api/auth/register
   - POST /api/auth/login
2. Fix any middleware or route configuration issues
3. Ensure proper error handling

### Task 2.3: Database Setup
1. Set up PostgreSQL or SQLite database
2. Configure DATABASE_URL in .env file
3. Run database migrations with Drizzle ORM
4. Verify database connectivity

## Success Criteria
- [ ] No critical security vulnerabilities
- [ ] Backend server starts on port 5001 without errors
- [ ] All API endpoints respond correctly
- [ ] Database connection established
- [ ] User registration and login working end-to-end

## Error Context from Web Evaluation
- Registration endpoint returning 500 Internal Server Error
- Authentication checks returning 401 Unauthorized
- Multiple resource loading failures (416 errors)
- Frontend expecting backend on port 5001

Please start with Task 1.2 and then move to Task 2.1 to get the backend server running. 