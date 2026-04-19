import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9006/api',
  withCredentials: true, // This is required for sending cookies/session ID
});

export default api;
