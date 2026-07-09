import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Notification from './components/Notification';
import Sidebar from './components/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import ProductList from './pages/products/ProductList';
import CategoryList from './pages/categories/CategoryList';
import OrderList from './pages/orders/OrderList';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <ProductList />
                </ProtectedRoute>
              } />
              <Route path="/categories" element={
                <ProtectedRoute>
                  <CategoryList />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <OrderList />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
          <Notification />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
