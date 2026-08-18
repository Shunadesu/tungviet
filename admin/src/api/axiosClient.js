import axios from 'axios';

const isFormData = (value) =>
  typeof FormData !== 'undefined' && (
    value instanceof FormData || Object.prototype.toString.call(value) === '[object FormData]'
  );

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Tránh xóa token + redirect nhiều lần trong cùng 1 phiên
let isRedirectingToLogin = false;
let consecutiveUnauthorized = 0;
let lastUnauthorizedAt = 0;

const markUnauthorizedAndMaybeLogout = (error) => {
  const now = Date.now();

  // Reset counter nếu lần 401 trước đó cách đây > 5s (coi như request độc lập)
  if (now - lastUnauthorizedAt > 5000) {
    consecutiveUnauthorized = 0;
  }
  lastUnauthorizedAt = now;
  consecutiveUnauthorized += 1;

  // Chỉ logout khi có ít nhất 2 request 401 liên tiếp trong 5s.
  // Tránh race khi 1 request fail vì token bị clear giữa chừng (StrictMode, hot reload, v.v.).
  if (consecutiveUnauthorized < 2) {
    return false;
  }

  // Tránh loop: chỉ redirect 1 lần
  if (isRedirectingToLogin) {
    return false;
  }
  isRedirectingToLogin = true;

  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');

  // Dùng replace để tránh tạo history entry
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
  return true;
};

axiosClient.interceptors.request.use(
  (config) => {
    if (isFormData(config.data)) {
      config.headers?.delete?.('Content-Type');
      if (config.headers) delete config.headers['Content-Type'];
    } else if (!config.headers?.['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    // Reset counter khi có response thành công
    consecutiveUnauthorized = 0;
    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      markUnauthorizedAndMaybeLogout(error);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;