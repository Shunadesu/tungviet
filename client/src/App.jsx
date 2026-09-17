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
import PageFallback from './components/PageFallback';

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
                            <ReactSuspense fallback={<PageFallback />}>
                              <Home />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="products"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <ProductList />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="products/compare"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <CompareProducts />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="products/:id"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <ProductDetail />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="quote"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <QuoteRequest />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="cart"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <QuoteBag />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="checkout"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <QuoteRequest />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="wishlist"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <Wishlist />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="login"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <Login />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="register"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <Register />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="orders"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <OrderHistory />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="about"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <About />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="about/board-of-directors"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <BoardOfDirectors />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="about/locations"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <Locations />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="about/leadership"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
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
                            <ReactSuspense fallback={<PageFallback />}>
                              <News />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="news/:slug"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <NewsDetail />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="markets"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <Markets />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="markets/:id"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <MarketDetail />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="main-trees"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <MainTrees />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="main-trees/:id"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <MainTreeDetail />
                            </ReactSuspense>
                          }
                        />
                        <Route
                          path="categories/:id"
                          element={
                            <ReactSuspense fallback={<PageFallback />}>
                              <CategoryDetail />
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
