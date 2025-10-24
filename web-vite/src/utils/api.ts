import axios from 'axios';

export const api = axios.create({
  // baseURL: 'https://api.dizelequefez.com.br',
  // baseURL: 'http://localhost:3000',
  baseURL: import.meta.env.VITE_BASE_URL_API,
  headers: {
    Authorization: localStorage.getItem('token')
  }
});