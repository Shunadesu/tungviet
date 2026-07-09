import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GiTreeBranch } from 'react-icons/gi';
import Banner from '../components/Banner';
import ProductSwiper from '../components/ProductSwiper';
import SectionHeader from '../components/SectionHeader';
import publicApi from '../api/publicApi';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        publicApi.getProducts({ limit: 10 }),
        publicApi.getCategories()
      ]);
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products by category
  const getProductsByCategory = (categoryId) => {
    return products.filter(p => p.categoryId?._id === categoryId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* Hero Banner */}
      <Banner />

      <div className="max-w-7xl mx-auto px-2 py-6">
        {/* Categories Section */}
        <section className="mb-6">
          <SectionHeader 
            title="Danh Mục Sản Phẩm" 
            icon={<GiTreeBranch />}
            subtitle="Khám phá các loại cây cảnh đa dạng"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {categories.map((cat, index) => (
              <motion.a
                key={cat._id}
                href={`/products?category=${cat._id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:border-primary transition-colors"
              >
                <img
                  src={cat.imageUrl || 'https://via.placeholder.com/100'}
                  alt={cat.name}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <h3 className="text-xs font-medium text-center">{cat.name}</h3>
              </motion.a>
            ))}
          </div>
        </section>

        {/* New Products */}
        <section className="mb-6">
          <SectionHeader 
            title="Sản Phẩm Mới" 
            subtitle="Những sản phẩm mới nhất"
          />
          {!loading && products.length > 0 && (
            <ProductSwiper products={products} />
          )}
        </section>

        {/* Featured Products by Category */}
        {categories.slice(0, 3).map((category) => {
          const catProducts = getProductsByCategory(category._id);
          if (catProducts.length === 0) return null;
          
          return (
            <section key={category._id} className="mb-6">
              <SectionHeader 
                title={category.name} 
                subtitle={category.description}
              />
              <ProductSwiper products={catProducts} />
            </section>
          );
        })}

        {/* CTA Banner */}
        <section className="bg-gradient-to-r from-primary-100 to-primary-50 rounded-lg p-4 my-6">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary mb-2">Bạn Cần Tư Vấn?</h2>
            <p className="text-xs text-gray-600 mb-3">Liên hệ ngay với chúng tôi để được hỗ trợ chọn cây phù hợp</p>
            <a href="tel:0123456789" className="btn-primary inline-block text-sm">
              Liên hệ tư vấn
            </a>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default Home;
