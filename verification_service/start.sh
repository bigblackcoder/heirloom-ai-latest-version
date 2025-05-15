
#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Face Verification Service..."

# Use the correct Python executable (system Python or the one in the environment)
python main.py
