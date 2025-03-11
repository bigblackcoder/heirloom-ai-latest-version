// Start the Vite server for React application
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Kill any existing server process
try {
  if (fs.existsSync(path.join(__dirname, 'server.pid'))) {
    const pid = fs.readFileSync(path.join(__dirname, 'server.pid'), 'utf8');
    if (pid) {
      console.log(`Stopping existing server process (PID: ${pid})...`);
      process.kill(Number(pid), 'SIGTERM');
    }
  }
} catch (error) {
  console.log('No existing server process found or error stopping it');
}

// Start the Vite server
console.log('Starting Vite server for React application...');
const serverProcess = exec('node vite-server.js');

// Save the PID for future reference
fs.writeFileSync(path.join(__dirname, 'server.pid'), String(serverProcess.pid));
console.log(`Server started with PID: ${serverProcess.pid}`);

// Forward stdout and stderr
serverProcess.stdout.on('data', (data) => {
  process.stdout.write(data);
});

serverProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});

// Handle process termination
serverProcess.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});

process.on('SIGINT', () => {
  serverProcess.kill();
  process.exit(0);
});