import axios from 'axios';

const TOKEN_KEY = 'ideias-token'

export const api = axios.create({
  // baseURL: 'https://api.dizelequefez.com.br',
  // baseURL: 'http://localhost:3000',
  baseURL: import.meta.env.VITE_BASE_URL_API,
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401, significa que o token é inválido ou expirou
    if (error.response?.status === 401) {
      // Limpar dados de autenticação
      localStorage.removeItem(TOKEN_KEY)

      // Redirecionar para login se não estiver na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/modelos/login'
      }
    }

    return Promise.reject(error)
  }
)
