import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7257/api',
});

api.interceptors.request.use((config) => {
  debugger;
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

export default api;
