// Start the standalone server
const { spawn } = require('child_process');
const fs = require('fs');

console.log('Starting Heirloom Identity Platform server...');

// Kill any existing server processes
try {
  const pidFile = './server.pid';
  if (fs.existsSync(pidFile)) {
    const pid = fs.readFileSync(pidFile, 'utf8').trim();
    if (pid) {
      console.log(`Killing existing server process (PID: ${pid})...`);
      process.kill(parseInt(pid, 10), 'SIGTERM');
    }
  }
} catch (error) {
  console.error('Error killing existing process:', error);
}

// Start the server
const server = spawn('node', ['pure-server.js'], {
  stdio: ['inherit', 'pipe', 'pipe']
});

// Save the process ID
fs.writeFileSync('./server.pid', server.pid.toString());

// Handle stdout
server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  // Also log to a file for debugging
  fs.appendFileSync('./server.log', output);
});

// Handle stderr
server.stderr.on('data', (data) => {
  const error = data.toString();
  console.error(error);
  
  // Also log to a file for debugging
  fs.appendFileSync('./server.log', `ERROR: ${error}`);
});

// Handle server exit
server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  fs.appendFileSync('./server.log', `Server process exited with code ${code}\n`);
  
  // Remove PID file
  try {
    fs.unlinkSync('./server.pid');
  } catch (error) {
    console.error('Error removing PID file:', error);
  }
});

console.log(`Server started with PID: ${server.pid}`);
console.log('Server logs will be available in server.log');