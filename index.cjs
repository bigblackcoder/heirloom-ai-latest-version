const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML file for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Biometric Auth Demo running at http://0.0.0.0:${PORT}`);
});