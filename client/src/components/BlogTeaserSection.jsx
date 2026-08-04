import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCalendar, FiClock } from 'react-icons/fi';
import publicApi from '../api/publicApi';
import { SUPPORTED_LOCALES } from '../i18n';
import SectionHeader from './SectionHeader';
import EmptyState from './EmptyState';

const normalizePosts = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.posts)) return payload.posts;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
};

const formatDate = (iso, lang) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(
      lang === 'en' ? 'en-US' : 'vi-VN',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  } catch {
    return '';
  }
};

const estimateReadTime = (text) => {
  if (!text) return 1;
  const words = text.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
};

const BlogTeaserSection = () => {
  const { t } = useTranslation();
  const { lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    publicApi
      .getPosts({ lang, limit: 3, status: 'published' })
      .then((r) => setPosts(normalizePosts(r.data)))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [lang]);

  const postsList = Array.isArray(posts) ? posts : [];

  if (!loading && postsList.length === 0) return null;

  const [featured, ...rest] = postsList;

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container-page">
        <SectionHeader
          eyebrow={t('blog.eyebrow', 'Insights')}
          title={t('blog.title', 'Kiến thức & Cập nhật')}
          subtitle={t('blog.subtitle', 'Bài viết mới nhất từ đội ngũ kỹ thuật của chúng tôi.')}
          align="center"
          className="mb-10"
        />

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="aspect-[16/9] skeleton !rounded-none" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-3 w-1/3" />
                  <div className="skeleton h-5 w-4/5" />
                  <div className="skeleton h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {featured && (
              <motion.article variants={cardVariants} className="lg:col-span-2 lg:row-span-1">
                <Link
                  to={`/${lang}/blog/${featured.slug || featured._id}`}
                  className="group relative block h-full bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                    {featured.coverImage || featured.image ? (
                      <img
                        src={featured.coverImage || featured.image}
                        alt={featured.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-emerald-100" />
                    )}
                    {(featured.category || featured.tag) && (
                      <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-primary backdrop-blur-sm">
                        {featured.category || featured.tag}
                      </span>
                    )}
                  </div>
                  <div className="p-6 md:p-7">
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                      <span className="inline-flex items-center gap-1">
                        <FiCalendar size={12} />
                        {formatDate(featured.publishedAt || featured.createdAt, lang)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FiClock size={12} />
                        {estimateReadTime(featured.content || featured.excerpt)} {t('blog.minutes', 'phút')}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {featured.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {(featured.excerpt || featured.summary || '').replace(/<[^>]+>/g, '')}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      {t('blog.readMore', 'Đọc tiếp')}
                      <FiArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            )}

            <div className="flex flex-col gap-6 lg:gap-7">
              {rest.length === 0 && !loading && (
                <EmptyState title={t('blog.empty', 'Chưa có bài viết')} description="" />
              )}
              {rest.map((post) => (
                <motion.article key={post._id} variants={cardVariants}>
                  <Link
                    to={`/${lang}/blog/${post.slug || post._id}`}
                    className="group block h-full bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
                        {post.coverImage || post.image ? (
                          <img
                            src={post.coverImage || post.image}
                            alt={post.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-emerald-100" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-1.5">
                          <span className="inline-flex items-center gap-1">
                            <FiCalendar size={11} />
                            {formatDate(post.publishedAt || post.createdAt, lang)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <FiClock size={11} />
                            {estimateReadTime(post.content || post.excerpt)} {t('blog.minutes', 'phút')}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-3 mb-1 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {(post.excerpt || post.summary || '').replace(/<[^>]+>/g, '')}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </motion.div>
        )}

        <div className="mt-10 text-center">
          <Link
            to={`/${lang}/blog`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700 transition-colors group"
          >
            {t('blog.viewAll', 'Xem tất cả bài viết')}
            <FiArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogTeaserSection;