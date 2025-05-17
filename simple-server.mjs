import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(__dirname));

// Serve the demo HTML file as the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Biometric Auth App running at http://0.0.0.0:${PORT}`);
});