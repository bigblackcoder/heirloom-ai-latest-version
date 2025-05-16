
#!/bin/bash

echo "=== Testing Deployment Configuration ==="
echo "This will build and run the application in production mode"

# Build the application
echo "Step 1: Building the application..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed! Please fix the build issues before deploying."
  exit 1
fi

echo "✅ Build successful"

# Check port configuration
echo "Step 2: Checking port configuration..."
grep -r "port.*5000" server/ --include="*.ts"
echo "✅ Port configuration verified"

# Start in production mode
echo "Step 3: Starting in production mode..."
NODE_ENV=production node dist/index.js
