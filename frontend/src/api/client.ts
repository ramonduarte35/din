import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
});

// Interceptor para injetar token JWT nas requisições e garantir que GET sempre vá ao backend
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@din:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Se for requisição GET, injeta _t para forçar bypass de qualquer cache do navegador/proxy
  if (config.method?.toLowerCase() === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
  }

  return config;
});

// Interceptor para redirecionar se o token expirar
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('@din:token');
      localStorage.removeItem('@din:user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
