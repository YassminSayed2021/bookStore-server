const vision = require('@google-cloud/vision');
const path = require('path');

// Init client with service account key
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, '../bookvisionai-31c4722c5e79.json'),
});

// Analyze image from URL
exports.extractTextFromImage = async (imageUrl) => {
  try {
    const [result] = await client.textDetection(imageUrl);
    const detections = result.textAnnotations;
    const fullText = detections.length ? detections[0].description : '';
    return fullText;
  } catch (error) {
    console.error('Vision API error:', error);
    throw new Error('Failed to extract text from image.');
  }
};
