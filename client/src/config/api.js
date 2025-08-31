// API Configuration
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // В продакшене используем текущий домен
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL;
