const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Kill any existing server process
try {
  const pid = fs.readFileSync(path.join(__dirname, 'server.pid'), 'utf8');
  if (pid) {
    console.log(`Stopping existing server process (PID: ${pid})...`);
    process.kill(Number(pid));
  }
} catch (error) {
  // No existing server process or error reading PID file
}

// Start the React server
console.log('Starting React server...');
const serverProcess = exec('node react-server.js');

// Save the PID to a file
fs.writeFileSync(path.join(__dirname, 'server.pid'), String(serverProcess.pid));
console.log(`Server started with PID: ${serverProcess.pid}`);

// Forward stdout and stderr
serverProcess.stdout.on('data', (data) => {
  process.stdout.write(data);
});

serverProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});

// Handle process exit
serverProcess.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle parent process exit
process.on('SIGINT', () => {
  console.log('Stopping server...');
  try {
    process.kill(serverProcess.pid);
  } catch (error) {
    console.error('Error stopping server:', error);
  }
  process.exit(0);
});