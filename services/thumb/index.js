const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Health check endpoint for Kubernetes probes
app.get('/health', (req, res) => {
  res.status(200).send('healthy');
});

// Thumbnail generation endpoint
app.post('/resize', upload.single('image'), async (req, res) => {
  try {
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).send('No image file uploaded');
    }

    // Get width and height from query params or use defaults
    const width = parseInt(req.query.width) || 200;
    const height = parseInt(req.query.height) || 200;

    // Process the image with sharp
    const processedImageBuffer = await sharp(req.file.buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .toBuffer();

    // Send the processed image as response
    res.set('Content-Type', 'image/jpeg');
    res.send(processedImageBuffer);
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Thumb service running on port ${PORT}`);
});
