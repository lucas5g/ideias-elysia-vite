import axios from 'axios';

export const api = axios.create({
  // baseURL: 'https://api.dizelequefez.com.br',
  baseURL: 'http://localhost:3000',
  headers: {
    Authorization: localStorage.getItem('token')
  }
});