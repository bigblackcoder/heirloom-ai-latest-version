#!/bin/bash

echo "Setting up local PostgreSQL database for Heirloom..."

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "Starting PostgreSQL..."
    brew services start postgresql@14 2>/dev/null || brew services start postgresql
fi

# Wait a moment for PostgreSQL to start
sleep 2

# Create database
echo "Creating database 'heirloom_dev'..."
createdb heirloom_dev 2>/dev/null || echo "Database already exists or couldn't create (this is usually okay)"

# Test connection
echo "Testing database connection..."
if psql -d heirloom_dev -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
    echo "Database URL: postgresql://$(whoami)@localhost:5432/heirloom_dev"
else
    echo "❌ Could not connect to database. Please check PostgreSQL installation."
    echo "You can try manually:"
    echo "  brew services start postgresql"
    echo "  createdb heirloom_dev"
fi