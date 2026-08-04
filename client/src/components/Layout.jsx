import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import QuoteSection from './QuoteSection';
import SeoMeta from './SeoMeta';
import FloatingContactBar from './FloatingContactBar';
import { useSiteConfig } from '../context/SiteConfigContext';
import publicApi from '../api/publicApi';

const Layout = () => {
  const [products, setProducts] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [quoteSection, setQuoteSection] = useState(null);
  const { seo, faviconUrl, floatingContacts } = useSiteConfig();

  useEffect(() => {
    publicApi.getProducts({ pageSize: 100 })
      .then((res) => {
        const items = res.data?.data?.products || res.data?.data || [];
        setProducts(items.map((p) => ({ _id: p._id, name: p.name })));
      })
      .catch(() => {});

    publicApi.getMarkets({ pageSize: 100 })
      .then((res) => {
        const items = res.data?.data?.markets || res.data?.data || [];
        setMarkets(items.map((m) => ({ _id: m._id, name: m.name })));
      })
      .catch(() => {});

    publicApi.getQuoteSection()
      .then((res) => {
        setQuoteSection(res.data?.data || null);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SeoMeta seo={seo} faviconUrl={faviconUrl} />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {quoteSection && (
        <QuoteSection
          data={quoteSection}
          products={products}
          markets={markets}
        />
      )}
      <FloatingContactBar contacts={floatingContacts} />
      <Footer />
    </div>
  );
};

export default Layout;
