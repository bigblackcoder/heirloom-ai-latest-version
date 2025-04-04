import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the public/images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Create OpenAI logo (ChatGPT)
const openaiSvg = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="28" fill="#E9F5F0"/>
  <rect width="64" height="64" rx="32" fill="#10A37F" fillOpacity="0.2"/>
  <path d="M46.5 24.25l-15 9-15-9m15 9v18" stroke="#10A37F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M46.5 39.75l-15 9-15-9m33-22.5l-15 9-15-9" stroke="#10A37F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
</svg>`;

// Create Perplexity logo
const perplexitySvg = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="28" fill="#FFF4EC"/>
  <circle cx="32" cy="32" r="16" fill="#F97316" fillOpacity="0.15" stroke="#F97316" strokeWidth="2"/>
  <path d="M32 24V40M24 32H40" stroke="#F97316" strokeWidth="2" strokeLinecap="round"/>
</svg>`;

// Create Microsoft Copilot logo
const copilotSvg = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="28" fill="#EFF6FC"/>
  <path d="M30 20C26.6863 20 24 22.6863 24 26M30 20C33.3137 20 36 22.6863 36 26M30 20V44M24 26V38C24 41.3137 26.6863 44 30 44M24 26H20C18.8954 26 18 26.8954 18 28V36C18 37.1046 18.8954 38 20 38H24M30 44C33.3137 44 36 41.3137 36 38V26M30 44H40C42.2091 44 44 42.2091 44 40V24C44 21.7909 42.2091 20 40 20H36M36 26H44" stroke="#0078D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>`;

// Write the SVG files
fs.writeFileSync(path.join(imagesDir, 'openai-logo.svg'), openaiSvg);
fs.writeFileSync(path.join(imagesDir, 'perplexity-logo.svg'), perplexitySvg);
fs.writeFileSync(path.join(imagesDir, 'copilot-logo.svg'), copilotSvg);

console.log('Logo SVG files created successfully in public/images/');