const fs = require('fs');
const path = require('path');

// Some packages publish JS files that reference source maps that are not shipped.
// This script creates an empty source map file so that webpack's source-map-loader
// doesn't emit a warning during dev builds.

const mapPath = path.join(__dirname, '..', 'node_modules', '@mediapipe', 'tasks-vision', 'vision_bundle_mjs.js.map');

try {
  const dir = path.dirname(mapPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(mapPath)) {
    fs.writeFileSync(mapPath, '{}');
    console.log('Created missing source map:', mapPath);
  }
} catch (err) {
  // Fail silently - this script is only to avoid the webpack warning.
  console.warn('Unable to create mediapipe source map file:', err.message);
}
