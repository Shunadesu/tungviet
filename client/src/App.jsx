import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QuoteBagProvider } from './context/QuoteBagContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';
import { ToastProvider } from './context/ToastContext';
import { SiteConfigProvider } from './context/SiteConfigContext';
import { AuthDrawerProvider } from './context/AuthDrawerContext';
import AuthDrawer from './components/AuthDrawer';
import LocaleGuard from './components/LocaleGuard';
import LocaleRedirect from './components/LocaleRedirect';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import CompareFloatingBar from './components/CompareFloatingBar';

import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import QuoteBag from './pages/QuoteBag';
import QuoteRequest from './pages/QuoteRequest';
import OrderHistory from './pages/OrderHistory';
import About from './pages/About';
import BoardOfDirectors from './pages/BoardOfDirectors';
import Locations from './pages/Locations';
import Leadership from './pages/Leadership';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Markets from './pages/Markets';
import MarketDetail from './pages/MarketDetail';
import MainTrees from './pages/MainTrees';
import MainTreeDetail from './pages/MainTreeDetail';
import CategoryDetail from './pages/CategoryDetail';
import Wishlist from './pages/Wishlist';
import CompareProducts from './pages/CompareProducts';
import NotFound from './pages/NotFound';

function App() {
  return (
    <SiteConfigProvider>
      <AuthProvider>
        <ToastProvider>
          <QuoteBagProvider>
            <WishlistProvider>
              <CompareProvider>
                <AuthDrawerProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <CompareFloatingBar />
                  <AuthDrawer />
                    <Routes>
                      <Route path="/" element={<LocaleRedirect />} />
                      <Route
                        path="/:lang"
                        element={
                          <LocaleGuard>
                            <Layout />
                          </LocaleGuard>
                        }
                      >
                        <Route index element={<Home />} />
                        <Route path="products" element={<ProductList />} />
                        <Route path="products/compare" element={<CompareProducts />} />
                        <Route path="products/:id" element={<ProductDetail />} />
                        <Route path="quote" element={<QuoteRequest />} />
                        <Route path="cart" element={<QuoteBag />} />
                        <Route path="checkout" element={<QuoteRequest />} />
                        <Route path="wishlist" element={<Wishlist />} />
                        <Route path="orders" element={<OrderHistory />} />
                        <Route path="about" element={<About />} />
                        <Route path="about/board-of-directors" element={<BoardOfDirectors />} />
                        <Route path="about/locations" element={<Locations />} />
                        <Route path="about/leadership" element={<Leadership />} />
                        <Route path="contact" element={<Navigate to="about" replace />} />
                        <Route path="news" element={<News />} />
                        <Route path="news/:slug" element={<NewsDetail />} />
                        <Route path="markets" element={<Markets />} />
                        <Route path="markets/:id" element={<MarketDetail />} />
                        <Route path="main-trees" element={<MainTrees />} />
                        <Route path="main-trees/:id" element={<MainTreeDetail />} />
                        <Route path="categories/:id" element={<CategoryDetail />} />
                        {/* Splat route bắt mọi đường dẫn chưa được đăng ký
                            (vd. /vi/khong-ton-tai, /vi/san-pham/abc/xyz) →
                            hiển thị trang 404 kèm nút quay về trang chủ. */}
                        <Route path="*" element={<NotFound />} />
                      </Route>
                      <Route path="*" element={<LocaleRedirect />} />
                    </Routes>
                </BrowserRouter>
                </AuthDrawerProvider>
              </CompareProvider>
            </WishlistProvider>
          </QuoteBagProvider>
        </ToastProvider>
      </AuthProvider>
    </SiteConfigProvider>
  );
}

export default App;
