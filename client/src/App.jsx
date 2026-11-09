import React, { Suspense as ReactSuspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { QuoteBagProvider } from './context/QuoteBagContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';
import { ToastProvider } from './context/ToastContext';
import { SiteConfigProvider } from './context/SiteConfigContext';
import LocaleGuard from './components/LocaleGuard';
import LocaleRedirect from './components/LocaleRedirect';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import CompareFloatingBar from './components/CompareFloatingBar';
import RouteProgress from './components/RouteProgress';

// Code-splitting via React.lazy() reduces initial bundle size significantly.
// Each page becomes its own chunk, loaded only when the user navigates to it.
// This shrinks the first-paint JS payload and improves LCP/TTI on slow networks.
const Home = React.lazy(() => import('./pages/Home'));
const ProductList = React.lazy(() => import('./pages/ProductList'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const QuoteBag = React.lazy(() => import('./pages/QuoteBag'));
const QuoteRequest = React.lazy(() => import('./pages/QuoteRequest'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const OrderHistory = React.lazy(() => import('./pages/OrderHistory'));
const About = React.lazy(() => import('./pages/About'));
const BoardOfDirectors = React.lazy(() => import('./pages/BoardOfDirectors'));
const Locations = React.lazy(() => import('./pages/Locations'));
const Leadership = React.lazy(() => import('./pages/Leadership'));
const News = React.lazy(() => import('./pages/News'));
const NewsDetail = React.lazy(() => import('./pages/NewsDetail'));
const Markets = React.lazy(() => import('./pages/Markets'));
const MarketDetail = React.lazy(() => import('./pages/MarketDetail'));
const MainTrees = React.lazy(() => import('./pages/MainTrees'));
const MainTreeDetail = React.lazy(() => import('./pages/MainTreeDetail'));
const CategoryDetail = React.lazy(() => import('./pages/CategoryDetail'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const CompareProducts = React.lazy(() => import('./pages/CompareProducts'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <SiteConfigProvider>
      <AuthProvider>
        <ToastProvider>
          <QuoteBagProvider>
            <WishlistProvider>
              <CompareProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <CompareFloatingBar />
                  <AnimatePresence mode="wait">
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
                        <Route
                          index
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <Home />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="products"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <ProductList />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="products/compare"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <CompareProducts />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="products/:id"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <ProductDetail />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="quote"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <QuoteRequest />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="cart"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <QuoteBag />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="checkout"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <QuoteRequest />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="wishlist"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <Wishlist />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="login"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <Login />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="register"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <Register />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="orders"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <OrderHistory />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="about"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <About />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="about/board-of-directors"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <BoardOfDirectors />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="about/locations"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <Locations />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="about/leadership"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <Leadership />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="contact"
                          element={<Navigate to="about" replace />}
                        />
                        <Route
                          path="news"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <News />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="news/:slug"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <NewsDetail />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="markets"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <Markets />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="markets/:id"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <MarketDetail />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="main-trees"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <MainTrees />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="main-trees/:id"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <MainTreeDetail />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="categories/:id"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <CategoryDetail />
                            </ReactSuspense>
                          }
                        />
                        {/* Splat route bắt mọi đường dẫn chưa được đăng ký
                            (vd. /vi/khong-ton-tai, /vi/san-pham/abc/xyz) →
                            hiển thị trang 404 kèm nút quay về trang chủ. */}
                        <Route
                          path="*"
                          element={
                            <ReactSuspense fallback={<RouteProgress />}>
                              <NotFound />
                            </ReactSuspense>
                          }
                        />
                      </Route>
                      <Route path="*" element={<LocaleRedirect />} />
                    </Routes>
                  </AnimatePresence>
                </BrowserRouter>
              </CompareProvider>
            </WishlistProvider>
          </QuoteBagProvider>
        </ToastProvider>
      </AuthProvider>
    </SiteConfigProvider>
  );
}

export default App;
