import { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      setUser(res.data.data.user);
      return res.data;
    }
    throw new Error(res.data.message);
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      setUser(res.data.data.user);
      return res.data;
    }
    throw new Error(res.data.message);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
