const path = require('path');
const fs = require('fs');

// MIME type mapping
const mimeTypes = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

function serveStaticFile(req, res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
  
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
  
  stream.on('error', (err) => {
    if (err.code === 'ENOENT') {
      res.status(404).send('File not found');
    } else {
      res.status(500).send('Internal server error');
    }
  });
}

function handleStaticFiles(req, res, next) {
  const url = req.url;
  
  // Handle static files
  if (url.startsWith('/static/')) {
    const filePath = path.join(__dirname, '../client/build', url);
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      serveStaticFile(req, res, filePath);
      return;
    }
  }
  
  // Handle other static files (manifest.json, favicon, etc.)
  if (url === '/manifest.json' || url === '/favicon.ico' || url === '/logo192.png' || url === '/logo512.png') {
    const filePath = path.join(__dirname, '../client/build', url);
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      serveStaticFile(req, res, filePath);
      return;
    }
  }
  
  next();
}

module.exports = handleStaticFiles;
