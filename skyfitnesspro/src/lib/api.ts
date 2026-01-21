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

api.interceptors.response.use(
  response => response,
  error => {
    // Если ошибка 401 на эндпоинте /users/me/progress и нет токена,
    // это нормально (пользователь не авторизован), игнорируем
    if (error.response?.status === 401 && 
        error.config?.url?.includes('/users/me/progress')) {
      // Возвращаем resolved promise с null вместо отклонения
      return Promise.resolve({ data: null });
    }
    
    return Promise.reject(error);
  }
);

export default api;