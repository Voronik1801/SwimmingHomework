// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://swimming-homework.vercel.app/api'
  : 'http://localhost:3001/api';

export default API_BASE_URL;
