import axios from "axios";

const api = axios.create({
    baseURL: 'https://wedev-api.sky.pro/api/fitness',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (['post', 'put', 'patch'].includes(config.method?.toLowerCase() ?? '')) {
    if (typeof config.data === 'object' && config.data !== null) {
      config.data = JSON.stringify(config.data);
    }
    config.headers['Content-Type'] = 'text/plain';
  }
    return config;
});

export default api;