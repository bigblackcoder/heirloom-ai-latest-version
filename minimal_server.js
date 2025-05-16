const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Add API forwarding for easier access
app.get('/api', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/api');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/verification/status', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/api/verification/status');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running on http://localhost:${PORT}`);
});