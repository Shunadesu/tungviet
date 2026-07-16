import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    let lang = null;
    try {
      lang = localStorage.getItem('locale');
    } catch (_) {}
    if (!lang) {
      const path = window.location?.pathname || '';
      const seg = path.split('/').filter(Boolean)[0];
      if (seg === 'vi' || seg === 'en') lang = seg;
    }
    if (lang) {
      config.headers['Accept-Language'] = lang;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {
        /* ignore */
      }
      let prefix = '';
      try {
        const seg = (window.location?.pathname || '').split('/').filter(Boolean)[0];
        if (seg === 'vi' || seg === 'en') prefix = `/${seg}`;
        else {
          const stored = localStorage.getItem('locale');
          if (stored === 'vi' || stored === 'en') prefix = `/${stored}`;
        }
      } catch {
        /* ignore */
      }
      // Dispatch a global event so the app can navigate without full reload.
      try {
        window.dispatchEvent(new CustomEvent('app:unauthorized', { detail: { prefix } }));
      } catch {
        window.location.href = `${prefix || ''}/login`;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;