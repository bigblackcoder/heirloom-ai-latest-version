
#!/bin/bash

echo "Checking build directory structure..."

# Make sure dist and client directories exist
mkdir -p dist
mkdir -p dist/client

# Check if index.html exists in dist/client
if [ ! -f dist/client/index.html ]; then
  echo "index.html not found in dist/client"
  
  # Check if index.html exists in client/dist
  if [ -f client/dist/index.html ]; then
    echo "Found index.html in client/dist, copying to dist/client"
    cp -r client/dist/* dist/client/
  fi
fi

# Print the directory structure
echo "Current dist directory structure:"
find dist -type f | sort

echo "Script completed"
