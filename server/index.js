const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const handleStaticFiles = require('./static');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: process.env.NODE_ENV === 'production'
        ? ["'self'", "https://*.vercel.app"]
        : ["'self'", "http://localhost:3000", "http://localhost:3001"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Разрешаем все домены в продакшене
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workout', require('./routes/workout'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/dictionary', require('./routes/dictionary'));

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  // Use custom static file handler
  app.use(handleStaticFiles);
  
  // Serve other static files
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle all other routes by serving index.html
  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../client/build', 'index.html');
    if (require('fs').existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Static files not found. Please run npm run build first.' });
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Что-то пошло не так!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Внутренняя ошибка сервера'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📱 SwimHomework готов к работе!`);
  console.log(`🌐 http://localhost:${PORT}`);
});
