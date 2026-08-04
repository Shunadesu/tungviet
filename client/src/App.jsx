import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { QuoteBagProvider } from './context/QuoteBagContext';
import { SiteConfigProvider } from './context/SiteConfigContext';
import LocaleGuard from './components/LocaleGuard';
import LocaleRedirect from './components/LocaleRedirect';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import Markets from './pages/Markets';
import MarketDetail from './pages/MarketDetail';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import QuoteBag from './pages/QuoteBag';
import QuoteRequest from './pages/QuoteRequest';
import Login from './pages/Login';
import Register from './pages/Register';
import OrderHistory from './pages/OrderHistory';
import About from './pages/About';
import BoardOfDirectors from './pages/BoardOfDirectors';
import Locations from './pages/Locations';
import Leadership from './pages/Leadership';
import Contact from './pages/Contact';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';

function App() {
  return (
    <SiteConfigProvider>
      <AuthProvider>
        <QuoteBagProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<LocaleRedirect />} />
                <Route path="/:lang" element={<LocaleGuard><Layout /></LocaleGuard>}>
                  <Route index element={<Home />} />
                  <Route path="markets" element={<Markets />} />
                  <Route path="markets/:id" element={<MarketDetail />} />
                  <Route path="products" element={<ProductList />} />
                  <Route path="products/:id" element={<ProductDetail />} />
                  <Route path="quote" element={<QuoteRequest />} />
                  <Route path="cart" element={<QuoteBag />} />
                  <Route path="checkout" element={<QuoteRequest />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="orders" element={<OrderHistory />} />
                  <Route path="about" element={<About />} />
                  <Route path="about/board-of-directors" element={<BoardOfDirectors />} />
                  <Route path="about/locations" element={<Locations />} />
                  <Route path="about/leadership" element={<Leadership />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="news" element={<News />} />
                  <Route path="news/:slug" element={<NewsDetail />} />
                </Route>
                <Route path="*" element={<LocaleRedirect />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </QuoteBagProvider>
      </AuthProvider>
    </SiteConfigProvider>
  );
}

export default App;