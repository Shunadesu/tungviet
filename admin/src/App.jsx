import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Notification from './components/Notification';
import Sidebar from './components/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import MarketList from './pages/markets/MarketList';
import MarketForm from './pages/markets/MarketForm';
import MemberList from './pages/members/MemberList';
import MemberForm from './pages/members/MemberForm';
import LocationList from './pages/locations/LocationList';
import LocationForm from './pages/locations/LocationForm';
import LeadershipList from './pages/leadership/LeadershipList';
import LeadershipForm from './pages/leadership/LeadershipForm';
import QuoteSectionForm from './pages/quoteSection/QuoteSectionForm';
import QuoteSubmissionList from './pages/quoteSection/QuoteSubmissionList';
import PartnerList from './pages/partners/PartnerList';
import PostList from './pages/posts/PostList';
import PostForm from './pages/posts/PostForm';
import CategoryList from './pages/categories/CategoryList';
import OrderList from './pages/orders/OrderList';
import AppearanceOverview from './pages/settings/AppearanceOverview';
import LogoSettings from './pages/settings/LogoSettings';
import HeroSlidesSettings from './pages/settings/HeroSlidesSettings';
import AboutSettings from './pages/settings/AboutSettings';
import FooterSettings from './pages/settings/FooterSettings';
import SEOSettings from './pages/settings/SEOSettings';
import FloatingContactSettings from './pages/settings/FloatingContactSettings';
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
              <Route path="/products/new" element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              } />
              <Route path="/products/:id/edit" element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              } />
              <Route path="/markets" element={
                <ProtectedRoute>
                  <MarketList />
                </ProtectedRoute>
              } />
              <Route path="/markets/new" element={
                <ProtectedRoute>
                  <MarketForm />
                </ProtectedRoute>
              } />
              <Route path="/markets/:id/edit" element={
                <ProtectedRoute>
                  <MarketForm />
                </ProtectedRoute>
              } />
              <Route path="/members" element={
                <ProtectedRoute>
                  <MemberList />
                </ProtectedRoute>
              } />
              <Route path="/members/new" element={
                <ProtectedRoute>
                  <MemberForm />
                </ProtectedRoute>
              } />
              <Route path="/members/:id/edit" element={
                <ProtectedRoute>
                  <MemberForm />
                </ProtectedRoute>
              } />
              <Route path="/locations" element={
                <ProtectedRoute>
                  <LocationList />
                </ProtectedRoute>
              } />
              <Route path="/locations/new" element={
                <ProtectedRoute>
                  <LocationForm />
                </ProtectedRoute>
              } />
              <Route path="/locations/:id/edit" element={
                <ProtectedRoute>
                  <LocationForm />
                </ProtectedRoute>
              } />
              <Route path="/leadership" element={
                <ProtectedRoute>
                  <LeadershipList />
                </ProtectedRoute>
              } />
              <Route path="/leadership/new" element={
                <ProtectedRoute>
                  <LeadershipForm />
                </ProtectedRoute>
              } />
              <Route path="/leadership/:id/edit" element={
                <ProtectedRoute>
                  <LeadershipForm />
                </ProtectedRoute>
              } />
              <Route path="/quote-section" element={
                <ProtectedRoute>
                  <QuoteSectionForm />
                </ProtectedRoute>
              } />
              <Route path="/quote-section/submissions" element={
                <ProtectedRoute>
                  <QuoteSubmissionList />
                </ProtectedRoute>
              } />
              <Route path="/partners" element={
                <ProtectedRoute>
                  <PartnerList />
                </ProtectedRoute>
              } />
              <Route path="/posts" element={
                <ProtectedRoute>
                  <PostList />
                </ProtectedRoute>
              } />
              <Route path="/posts/new" element={
                <ProtectedRoute>
                  <PostForm />
                </ProtectedRoute>
              } />
              <Route path="/posts/:id/edit" element={
                <ProtectedRoute>
                  <PostForm />
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
              <Route path="/settings/appearance" element={
                <ProtectedRoute>
                  <AppearanceOverview />
                </ProtectedRoute>
              } />
              <Route path="/settings/appearance/logo" element={
                <ProtectedRoute>
                  <LogoSettings />
                </ProtectedRoute>
              } />
              <Route path="/settings/appearance/hero" element={
                <ProtectedRoute>
                  <HeroSlidesSettings />
                </ProtectedRoute>
              } />
              <Route path="/settings/appearance/about" element={
                <ProtectedRoute>
                  <AboutSettings />
                </ProtectedRoute>
              } />
              <Route path="/settings/appearance/footer" element={
                <ProtectedRoute>
                  <FooterSettings />
                </ProtectedRoute>
              } />
              <Route path="/settings/appearance/seo" element={
                <ProtectedRoute>
                  <SEOSettings />
                </ProtectedRoute>
              } />
              <Route path="/settings/appearance/floating-contacts" element={
                <ProtectedRoute>
                  <FloatingContactSettings />
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