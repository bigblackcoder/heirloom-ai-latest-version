
// Simple script to generate a test image and encode it as base64
const { createCanvas } = require('canvas');
const fs = require('fs');

// Create a simple canvas with a "face-like" circle
const width = 400;
const height = 400;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Fill background
ctx.fillStyle = '#f0f0f0';
ctx.fillRect(0, 0, width, height);

// Draw "face"
ctx.fillStyle = '#ffd0b0';
ctx.beginPath();
ctx.arc(width/2, height/2, 150, 0, Math.PI * 2);
ctx.fill();

// Draw "eyes"
ctx.fillStyle = '#404040';
ctx.beginPath();
ctx.arc(width/2 - 50, height/2 - 30, 20, 0, Math.PI * 2);
ctx.arc(width/2 + 50, height/2 - 30, 20, 0, Math.PI * 2);
ctx.fill();

// Draw "mouth"
ctx.beginPath();
ctx.arc(width/2, height/2 + 50, 70, 0.2 * Math.PI, 0.8 * Math.PI);
ctx.lineWidth = 10;
ctx.stroke();

// Save the image to a file
const buffer = canvas.toBuffer('image/jpeg');
fs.writeFileSync('./test_face.jpg', buffer);

// Also encode it as base64
const base64Image = buffer.toString('base64');
console.log(base64Image);
