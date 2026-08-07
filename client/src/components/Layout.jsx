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
  const [mainTrees, setMainTrees] = useState([]);
  const [quoteSection, setQuoteSection] = useState(null);
  const { seo, faviconUrl, floatingContacts } = useSiteConfig();

  useEffect(() => {
    publicApi.getProducts({ limit: 100 })
      .then((res) => {
        const data = res.data?.data;
        const items = Array.isArray(data) ? data : data?.items || [];
        setProducts(items.map((p) => ({ _id: p._id, name: p.name })));
      })
      .catch(() => {});

    publicApi.getMainTrees()
      .then((res) => {
        const items = Array.isArray(res.data?.data) ? res.data.data : [];
        setMainTrees(items.map((m) => ({ _id: m._id, name: m.name })));
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
          mainTrees={mainTrees}
        />
      )}
      <FloatingContactBar contacts={floatingContacts} />
      <Footer />
    </div>
  );
};

export default Layout;
