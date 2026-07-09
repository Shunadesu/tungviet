import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiGrid, FiList } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import publicApi from '../api/publicApi';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const categoryId = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';

  useEffect(() => {
    fetchData();
  }, [categoryId, search, sort]);

  const fetchData = async () => {
    try {
      const params = {};
      if (categoryId) params.category = categoryId;
      if (search) params.search = search;
      if (sort) params.sort = sort;

      const [productsRes, categoriesRes] = await Promise.all([
        publicApi.getProducts(params),
        publicApi.getCategories()
      ]);
      
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const getCategoryName = () => {
    if (!categoryId) return 'Tất cả sản phẩm';
    const cat = categories.find(c => c._id === categoryId);
    return cat?.name || 'Sản phẩm';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-8"
    >
      {/* Header */}
      <div className="bg-primary text-white py-4">
        <div className="max-w-7xl mx-auto px-2">
          <h1 className="text-lg font-semibold">{getCategoryName()}</h1>
          <p className="text-xs text-white/70">{products.length} sản phẩm</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 py-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 text-xs text-gray-600 md:hidden"
          >
            <FiFilter size={16} />
            Bộ lọc
          </button>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
          >
            <option value="">Mặc định</option>
            <option value="price_asc">Giá: Thấp đến cao</option>
            <option value="price_desc">Giá: Cao đến thấp</option>
            <option value="name_asc">Tên: A-Z</option>
          </select>

          {/* View Mode */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100'}`}
            >
              <FiGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100'}`}
            >
              <FiList size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-48 flex-shrink-0`}>
            <div className="bg-white rounded-lg p-3 sticky top-16">
              <h3 className="text-xs font-semibold text-primary mb-2">Danh mục</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded ${!categoryId ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleFilterChange('category', cat._id)}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded ${categoryId === cat._id ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">Không tìm thấy sản phẩm nào</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2' : 'space-y-2'}>
                {products.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductList;
