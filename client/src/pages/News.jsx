import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import publicApi from '../api/publicApi';

const CATEGORIES = ['Tin cong nghe', 'Huong dan su dung', 'Tin khuyen mai', 'Tin tu van', 'Chia se'];

const News = () => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => { fetchPosts(1); }, [activeCategory]);

  const fetchPosts = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 9 };
      if (activeCategory) params.category = activeCategory;
      const res = await publicApi.getPosts(params);
      const data = res.data?.data || {};
      setPosts(data.items || []);
      setPage(data.page || 1);
      setTotalPages(data.pages || 1);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(isVi ? 'vi-VN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  return (
    <>
      <SEO
        title={isVi ? 'Tin tuc & Blog' : 'News & Blog'}
        description={isVi ? 'Tin tuc cong nghe, huong dan su dung, tin khuyen mai' : 'Technology news, usage guides, promotions'}
      />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary/90 to-primary py-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{isVi ? 'Tin tuc & Blog' : 'News & Blog'}</h1>
          <p className="text-white/80">{isVi ? 'Cap nhat tin tuc, kien thuc va khuyen mai moi nhat' : 'Latest news, knowledge and promotions'}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActiveCategory('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !activeCategory ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {isVi ? 'Tat ca' : 'All'}
          </button>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-48 mb-4" />
                <div className="bg-gray-200 h-4 w-3/4 rounded mb-2" />
                <div className="bg-gray-200 h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">{isVi ? 'Chua co bai viet nao.' : 'No posts yet.'}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post._id} to={`/news/${post.slug}`} className="group">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                        <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    <div className="p-4">
                      {post.category && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{post.category}</span>
                      )}
                      <h3 className="font-semibold text-gray-800 mt-2 mb-1 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                      {post.excerpt && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                        {post.viewCount > 0 && <span>{post.viewCount} {isVi ? 'luot xem' : 'views'}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => { setPage(i + 1); fetchPosts(i + 1); }}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === i + 1 ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default News;
