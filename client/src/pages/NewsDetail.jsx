import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import QuoteForm from '../components/QuoteForm';
import publicApi from '../api/publicApi';

const NewsDetail = () => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    setLoading(true);
    publicApi.getPost(slug)
      .then((res) => {
        const data = res.data?.data;
        if (!data) { navigate('/news', { replace: true }); return; }
        setPost(data);
        setRelated(data.related || []);
      })
      .catch(() => navigate('/news', { replace: true }))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(isVi ? 'vi-VN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-4">
        <div className="bg-gray-200 h-80 rounded-xl" />
        <div className="bg-gray-200 h-8 w-3/4 rounded" />
        <div className="bg-gray-200 h-4 w-1/2 rounded" />
      </div>
    </div>
  );

  if (!post) return null;

  const seoTitle = post.seoTitle || post.title;
  const seoDesc = post.seoDescription || post.excerpt || '';
  const seoKeywords = post.seoKeywords || '';
  const ogImage = post.thumbnail || '';

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDesc}
        keywords={seoKeywords}
        url={`/${isVi ? 'vi' : 'en'}/news/${slug}`}
        image={ogImage}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary">{isVi ? 'Trang chu' : 'Home'}</Link>
          <span>/</span>
          <Link to="/news" className="hover:text-primary">{isVi ? 'Tin tuc' : 'News'}</Link>
          <span>/</span>
          <span className="text-gray-700 truncate">{post.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Hero image */}
            {post.thumbnail && (
              <img src={post.thumbnail} alt={post.title}
                className="w-full max-h-96 object-cover rounded-xl mb-6" />
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {post.category && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{post.category}</span>
              )}
              <span className="text-sm text-gray-400">{formatDate(post.publishedAt || post.createdAt)}</span>
              {post.viewCount > 0 && (
                <span className="text-sm text-gray-400">{post.viewCount} {isVi ? 'luot xem' : 'views'}</span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">{post.title}</h1>

            {/* Facebook link */}
            {post.facebookUrl && (
              <a href={post.facebookUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {isVi ? 'Xem tren Facebook' : 'View on Facebook'}
              </a>
            )}

            {/* Content */}
            {post.content && (
              <div
                className="prose max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}

            {/* Image Gallery */}
            {post.images?.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-800 mb-4">{isVi ? 'Thu vien hinh anh' : 'Image Gallery'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {post.images.map((url, idx) => (
                    <img key={idx} src={url} alt="" onClick={() => setLightbox(url)}
                      className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border" />
                  ))}
                </div>
              </div>
            )}

            {/* Related posts */}
            {related.length > 0 && (
              <div className="border-t pt-8">
                <h3 className="font-semibold text-gray-800 mb-4">{isVi ? 'Bai viet lien quan' : 'Related Posts'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map((r) => (
                    <Link key={r._id} to={`/news/${r.slug}`} className="group">
                      {r.thumbnail && (
                        <img src={r.thumbnail} alt={r.title} className="w-full h-32 object-cover rounded-lg mb-2 group-hover:opacity-80 transition-opacity" />
                      )}
                      <h4 className="text-sm font-medium text-gray-700 line-clamp-2 group-hover:text-primary transition-colors">{r.title}</h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <QuoteForm postTitle={post.title} />
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white text-3xl">&times;</button>
        </div>
      )}
    </>
  );
};

export default NewsDetail;
