const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth verification
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Токен не предоставлен' });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    // Проверяем, что пользователь из разрешенной школы плавания
    const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];
    const userDomain = payload.hd || payload.email.split('@')[1];
    
    if (allowedDomains.length > 0 && !allowedDomains.includes(userDomain)) {
      return res.status(403).json({ 
        error: 'Доступ ограничен для вашей школы плавания' 
      });
    }

    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      domain: userDomain
    };

    res.json({
      success: true,
      user,
      message: 'Авторизация успешна'
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ 
      error: 'Ошибка авторизации',
      message: 'Не удалось проверить токен Google'
    });
  }
});

// Проверка статуса авторизации
router.get('/status', (req, res) => {
  // В MVP версии просто возвращаем успех
  // В реальном приложении здесь была бы проверка сессии
  res.json({
    authenticated: true,
    message: 'Пользователь авторизован'
  });
});

module.exports = router;
