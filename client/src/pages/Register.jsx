import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white px-2 py-8"
    >
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <span className="text-3xl">🌿</span>
            <h1 className="text-lg font-semibold text-primary mt-2">Đăng ký</h1>
            <p className="text-xs text-gray-500 mt-1">Tạo tài khoản mới</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Họ tên</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Mật khẩu</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Ít nhất 6 ký tự"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Nhập lại mật khẩu"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FiUserPlus size={16} />
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs">
            <span className="text-gray-500">Đã có tài khoản? </span>
            <Link to="/login" className="text-primary font-medium hover:underline">
              Đăng nhập
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t">
            <Link to="/" className="block text-center text-xs text-gray-500 hover:text-primary">
              ← Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;
