import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import Skeleton from '../components/Skeleton';
import QuoteForm from '../components/QuoteForm';
import publicApi from '../api/publicApi';
import { sanitizeHtml } from '../utils/sanitize';
import { htmlToText } from '../utils/html';
import { buildArticleJsonLd } from '../utils/jsonLd';

const NewsDetail = () => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const lang = isVi ? 'vi' : 'en';
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  const getCategoryLabel = (cat) => {
    if (!cat) return '';
    if (isVi) return cat.name || cat.nameEn || cat.slug;
    return cat.nameEn || cat.name || cat.slug;
  };

  const getCategorySlug = (cat) => {
    if (!cat) return '';
    if (typeof cat === 'string') return cat;
    return cat.slug || '';
  };

  const category = post?.category && typeof post.category === 'object' ? post.category : null;
  const categorySlug = getCategorySlug(category);

  useEffect(() => {
    setLoading(true);
    publicApi.getPost(slug)
      .then((res) => {
        const data = res.data?.data;
        if (!data) { navigate(`/${lang}/news`, { replace: true }); return; }
        setPost(data);
        setRelated(data.related || []);
      })
      .catch(() => navigate(`/${lang}/news`, { replace: true }))
      .finally(() => setLoading(false));
  }, [slug, navigate, lang]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(isVi ? 'vi-VN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  if (loading) return <Skeleton.NewsDetail />;

  if (!post) return null;

  const seoTitle = post.seoTitle || post.title;
  const seoDesc = htmlToText(post.seoDescription || post.excerpt || '').slice(0, 200);
  const seoKeywords = post.seoKeywords || '';
  const ogImage = post.thumbnail || '';
  const pageUrl = `/${isVi ? 'vi' : 'en'}/news/${slug}`;

  const breadcrumb = [
    { label: isVi ? 'Trang chủ' : 'Home', to: `/${lang}` },
    { label: isVi ? 'Tin tức' : 'News', to: `/${lang}/news` },
  ];
  if (categorySlug && category) {
    breadcrumb.push({
      label: getCategoryLabel(category),
      to: `/${lang}/news?category=${categorySlug}`,
    });
  }
  breadcrumb.push({ label: post.title });

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDesc}
        keywords={seoKeywords}
        url={pageUrl}
        image={ogImage}
        type="article"
        breadcrumb={breadcrumb}
        jsonLd={buildArticleJsonLd(post, { lang, url: pageUrl })}
        publishedTime={post.publishedAt || post.createdAt}
        modifiedTime={post.updatedAt || post.publishedAt || post.createdAt}
        author={post.author?.name || 'Tungviet'}
        section={category ? getCategoryLabel(category) : undefined}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          {breadcrumb.map((item, idx) => {
            const isLast = idx === breadcrumb.length - 1;
            return (
              <span key={idx} className="flex items-center gap-2">
                {!isLast && item.to ? (
                  <Link to={item.to} className="hover:text-primary">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-gray-700 truncate max-w-[260px] inline-block align-bottom' : ''}>
                    {item.label}
                  </span>
                )}
                {!isLast && <span>/</span>}
              </span>
            );
          })}
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
              {categorySlug && (
                <Link
                  to={`/${lang}/news?category=${categorySlug}`}
                  className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                >
                  {getCategoryLabel(category)}
                </Link>
              )}
              <span className="text-sm text-gray-400">{formatDate(post.publishedAt || post.createdAt)}</span>
              {post.viewCount > 0 && (
                <span className="text-sm text-gray-400">{post.viewCount} {isVi ? 'lượt xem' : 'views'}</span>
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
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
              />
            )}

            {/* Image Gallery */}
            {post.images?.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-800 mb-4">{isVi ? 'Thu vien hinh anh' : 'Image Gallery'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {post.images.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLightbox(url)}
                      aria-label={isVi ? `Xem ảnh ${idx + 1}` : `View image ${idx + 1}`}
                      className="block w-full h-40 overflow-hidden rounded-lg border border-gray-200 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
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
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isVi ? 'Xem ảnh phóng to' : 'Enlarged image'}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setLightbox(null);
          }}
          tabIndex={-1}
        >
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label={isVi ? 'Đóng' : 'Close'}
            className="absolute top-4 right-4 text-white text-3xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default NewsDetail;
