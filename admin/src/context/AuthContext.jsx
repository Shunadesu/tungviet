import { createContext, useContext, useState, useEffect } from 'react';
import adminApi from '../api/adminApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    const token = localStorage.getItem('adminToken');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await adminApi.login({ email, password });
    if (res.data.success && res.data.data.user.role === 'admin') {
      localStorage.setItem('adminToken', res.data.data.token);
      localStorage.setItem('adminUser', JSON.stringify(res.data.data.user));
      setUser(res.data.data.user);
      return res.data;
    }
    throw new Error('Bạn không có quyền truy cập Admin');
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
