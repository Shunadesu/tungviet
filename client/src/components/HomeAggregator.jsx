import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { FiArrowRight, FiAward, FiBox, FiCheckCircle, FiGlobe, FiMessageSquare, FiUsers, FiMapPin, FiPhone, FiMail, FiStar } from 'react-icons/fi';
import HeroSlider from './HeroSlider';
import { useHomeData } from '../hooks/useHomeData';
import { getLocalizedField } from '../utils/i18nField';
import publicApi from '../api/publicApi';

const pickText = (item, lang, viKey = 'name', enKey = null) => {
  if (!item) return '';
  if (enKey && item[enKey] && lang === 'en') return item[enKey];
  return item[viKey] || (enKey ? item[enKey] : '') || '';
};

const isEnabled = (homeSections, key) => {
  if (!Array.isArray(homeSections) || homeSections.length === 0) return true;
  const section = homeSections.find((s) => s.key === key);
  return section ? section.enabled !== false : true;
};

const sectionTitle = (homeSections, key, fallback) => {
  if (!Array.isArray(homeSections)) return fallback;
  const section = homeSections.find((s) => s.key === key);
  if (!section) return fallback;
  return lang === 'en' ? (section.title?.en || fallback) : (section.title?.vi || fallback);
};

let lang = 'vi';

const ProductCard = ({ product, lang }) => (
  <Link
    to={`/${lang}/products/${product._id}`}
    className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100"
  >
    <div className="aspect-square overflow-hidden bg-gray-50 relative">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300">
          <FiBox size={48} />
        </div>
      )}
      {product.isNew && (
        <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
          NEW
        </span>
      )}
      {product.isFeatured && (
        <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
          HOT
        </span>
      )}
    </div>
    <div className="p-3">
      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
        {product.name}
      </h3>
      {product.productCode && (
        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{product.productCode}</p>
      )}
      {product.priceVisible && product.price > 0 && (
        <p className="text-sm font-bold text-primary mt-1">
          {new Intl.NumberFormat('vi-VN').format(product.price)} ₫
        </p>
      )}
    </div>
  </Link>
);

const SectionTitle = ({ title, subtitle, actionLabel, actionHref }) => (
  <div className="flex items-end justify-between mb-4">
    <div>
      {title && <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>}
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
    {actionLabel && actionHref && (
      <Link
        to={actionHref}
        className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
      >
        {actionLabel}
        <FiArrowRight size={12} />
      </Link>
    )}
  </div>
);

const FastFacts = ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <section className="py-10 bg-gradient-to-br from-primary/5 via-white to-primary/5">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((fact, idx) => (
          <motion.div
            key={fact._id || idx}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="text-center"
          >
            <div className="text-3xl md:text-4xl font-extrabold text-primary">
              {fact.value}
              {fact.suffix && <span className="text-base ml-1">{fact.suffix}</span>}
            </div>
            <div className="text-xs md:text-sm text-gray-600 mt-1">{fact.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const CoreValues = ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
        {items.map((value, idx) => (
          <div
            key={value._id || idx}
            className="p-6 rounded-xl border border-gray-100 hover:border-primary/30 transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <FiCheckCircle size={20} />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{value.title}</h3>
            <p className="text-xs text-gray-500 mt-2 line-clamp-3">{value.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const Stats = ({ stats }) => {
  if (!stats) return null;
  const items = [
    { value: stats.products || 0, label: lang === 'en' ? 'Products' : 'Sản phẩm', icon: FiBox },
    { value: stats.markets || 0, label: lang === 'en' ? 'Markets' : 'Thị trường', icon: FiGlobe },
    { value: stats.partners || 0, label: lang === 'en' ? 'Partners' : 'Đối tác', icon: FiUsers },
    { value: stats.customers || 0, label: lang === 'en' ? 'Customers' : 'Khách hàng', icon: FiUsers },
  ];
  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((it, idx) => (
          <div key={idx} className="text-center">
            <it.icon className="mx-auto text-primary mb-2" size={24} />
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {it.value}+
            </div>
            <div className="text-xs text-gray-500 mt-1">{it.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Industries = ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle
          title={lang === 'en' ? 'Industries we serve' : 'Ngành hàng của chúng tôi'}
          subtitle={lang === 'en'
            ? 'Browse our product portfolio by industry'
            : 'Khám phá danh mục sản phẩm theo ngành'}
          actionLabel={lang === 'en' ? 'View all' : 'Xem tất cả'}
          actionHref={`/${lang}/main-trees`}
        />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((ind) => (
            <Link
              key={ind._id}
              to={`/${lang}/main-trees/${ind._id}`}
              className="group p-5 rounded-xl border border-gray-100 hover:border-primary/40 hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50"
            >
              {ind.imageUrl && (
                <img
                  src={ind.imageUrl}
                  alt={ind.name}
                  className="w-12 h-12 object-cover rounded-lg mb-3"
                  loading="lazy"
                />
              )}
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary">
                {ind.name}
              </h3>
              {ind.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ind.description}</p>
              )}
              <p className="text-[10px] text-primary font-semibold mt-2">
                {ind.productCount} {lang === 'en' ? 'products' : 'sản phẩm'}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const MarketsGrid = ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle
          title={lang === 'en' ? 'Featured markets' : 'Thị trường nổi bật'}
          subtitle={lang === 'en'
            ? 'Our products are trusted across multiple markets'
            : 'Sản phẩm của chúng tôi được tin dùng ở nhiều thị trường'}
          actionLabel={lang === 'en' ? 'All markets' : 'Tất cả thị trường'}
          actionHref={`/${lang}/markets`}
        />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {items.map((market) => (
            <Link
              key={market._id}
              to={`/${lang}/markets/${market._id}`}
              className="group relative overflow-hidden rounded-xl aspect-video bg-gray-200"
            >
              {market.imageUrl ? (
                <img
                  src={market.imageUrl}
                  alt={market.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FiGlobe size={40} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-sm md:text-base">
                  {market.title}
                </h3>
                {market.industry?.name && (
                  <p className="text-[10px] text-white/80 mt-1">
                    {market.industry.name}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const Certificates = ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <section className="py-10 bg-white border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <h3 className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide mb-6">
          {lang === 'en' ? 'Certified by international organizations' : 'Được chứng nhận bởi các tổ chức quốc tế'}
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {items.map((cert) => (
            <div
              key={cert._id}
              className="flex flex-col items-center gap-2 group"
              title={cert.name}
            >
              {cert.imageUrl ? (
                <img
                  src={cert.imageUrl}
                  alt={cert.name}
                  loading="lazy"
                  className="h-16 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <FiAward size={24} />
                </div>
              )}
              <span className="text-[10px] text-gray-500 font-medium">
                {cert.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <section className="py-12 bg-gradient-to-br from-primary/5 to-white">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle
          title={lang === 'en' ? 'What our clients say' : 'Khách hàng nói gì về chúng tôi'}
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                  <FiStar key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-sm text-gray-700 italic line-clamp-4 mb-4">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 border-t pt-3">
                {t.avatarUrl ? (
                  <img
                    src={t.avatarUrl}
                    alt={t.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {(t.author || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t.author}</div>
                  {(t.role || t.company) && (
                    <div className="text-[10px] text-gray-500">
                      {[t.role, t.company].filter(Boolean).join(' - ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BlogTeaser = ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle
          title={lang === 'en' ? 'Latest news & insights' : 'Tin tức & Bài viết'}
          actionLabel={lang === 'en' ? 'All news' : 'Tất cả'}
          actionHref={`/${lang}/news`}
        />
        <div className="grid md:grid-cols-3 gap-5">
          {items.map((post) => (
            <Link
              key={post._id}
              to={`/${lang}/news/${post.slug}`}
              className="group block bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all"
            >
              {post.thumbnail && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const Partners = ({ partner, customer }) => {
  const total = (partner?.length || 0) + (customer?.length || 0);
  if (total === 0) return null;
  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {Array.isArray(partner) && partner.length > 0 && (
          <>
            <h3 className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
              {lang === 'en' ? 'Our partners' : 'Đối tác'}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
              {partner.map((p) => (
                <div key={p._id} title={p.name}>
                  {p.logo ? (
                    <img
                      src={p.logo}
                      alt={p.name}
                      loading="lazy"
                      className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-gray-500">{p.name}</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        {Array.isArray(customer) && customer.length > 0 && (
          <>
            <h3 className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
              {lang === 'en' ? 'Trusted by' : 'Khách hàng tin dùng'}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {customer.map((p) => (
                <div key={p._id} title={p.name}>
                  {p.logo ? (
                    <img
                      src={p.logo}
                      alt={p.name}
                      loading="lazy"
                      className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-gray-500">{p.name}</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

const Members = ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle
          title={lang === 'en' ? 'Our leadership' : 'Ban lãnh đạo'}
          actionLabel={lang === 'en' ? 'About us' : 'Về chúng tôi'}
          actionHref={`/${lang}/about`}
        />
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {items.map((m) => (
            <div key={m._id} className="text-center">
              {m.imageUrl ? (
                <img
                  src={m.imageUrl}
                  alt={m.name}
                  loading="lazy"
                  className="w-24 h-24 rounded-full mx-auto object-cover mb-3"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto bg-primary/10 text-primary flex items-center justify-center mb-3 text-2xl font-bold">
                  {(m.name || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <h3 className="text-sm font-semibold text-gray-900">{m.name}</h3>
              {m.position && (
                <p className="text-xs text-gray-500 mt-1">{m.position}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const QuoteCTA = ({ quote }) => {
  if (!quote || !quote.title) return null;
  return (
    <section
      className="py-16 bg-gradient-to-r from-primary to-primary/80 text-white"
      style={
        quote.backgroundUrl
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${quote.backgroundUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}
      }
    >
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">{quote.title}</h2>
        {quote.subtitle && (
          <p className="text-sm md:text-base opacity-90 mb-6">{quote.subtitle}</p>
        )}
        <Link
          to={`/${lang}/quote-bag`}
          className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {lang === 'en' ? 'Request a quote' : 'Yêu cầu báo giá'}
          <FiArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};

const HomeAggregator = () => {
  const { i18n } = useTranslation();
  lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  const { data, loading } = useHomeData(lang);
  const cfg = data?.siteConfig;
  const sections = data?.homeSections || [];

  // Track view for popular products
  const trackedRef = useRef(new Set());
  useEffect(() => {
    if (!Array.isArray(data?.popularProducts)) return;
    data.popularProducts.forEach((p) => {
      if (p && p._id && !trackedRef.current.has(p._id)) {
        trackedRef.current.add(p._id);
        publicApi.incrementView(p._id).catch(() => {});
      }
    });
  }, [data?.popularProducts]);

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <HeroSlider />
      {isEnabled(sections, 'fastFacts') && data?.siteConfig?.fastFacts?.length > 0 && (
        <FastFacts items={data.siteConfig.fastFacts} />
      )}
      {isEnabled(sections, 'coreValues') && data?.siteConfig?.coreValues?.length > 0 && (
        <CoreValues items={data.siteConfig.coreValues} />
      )}
      {isEnabled(sections, 'featuredProducts') && data?.featuredProducts?.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <SectionTitle
              title={lang === 'en' ? 'Featured products' : 'Sản phẩm nổi bật'}
              subtitle={lang === 'en'
                ? 'Hand-picked by our experts'
                : 'Tuyển chọn bởi chuyên gia của chúng tôi'}
              actionLabel={lang === 'en' ? 'All products' : 'Xem tất cả'}
              actionHref={`/${lang}/products`}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {data.featuredProducts.map((p) => (
                <ProductCard key={p._id} product={p} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}
      {isEnabled(sections, 'newProducts') && data?.newProducts?.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <SectionTitle
              title={lang === 'en' ? 'New arrivals' : 'Sản phẩm mới'}
              actionLabel={lang === 'en' ? 'All products' : 'Xem tất cả'}
              actionHref={`/${lang}/products`}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {data.newProducts.map((p) => (
                <ProductCard key={p._id} product={p} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}
      {isEnabled(sections, 'industries') && data?.industries?.length > 0 && (
        <Industries items={data.industries} />
      )}
      {isEnabled(sections, 'markets') && data?.featuredMarkets?.length > 0 && (
        <MarketsGrid items={data.featuredMarkets} />
      )}
      {isEnabled(sections, 'popularProducts') && data?.popularProducts?.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <SectionTitle
              title={lang === 'en' ? 'Most viewed' : 'Xem nhiều nhất'}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.popularProducts.map((p) => (
                <ProductCard key={p._id} product={p} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}
      {isEnabled(sections, 'certificates') && data?.siteConfig?.certificates?.length > 0 && (
        <Certificates items={data.siteConfig.certificates} />
      )}
      {isEnabled(sections, 'testimonials') && data?.siteConfig?.testimonials?.length > 0 && (
        <Testimonials items={data.siteConfig.testimonials} />
      )}
      {isEnabled(sections, 'blog') && data?.posts?.length > 0 && (
        <BlogTeaser items={data.posts} />
      )}
      {isEnabled(sections, 'partners') && data?.partners && (
        <Partners partner={data.partners.partner} customer={data.partners.customer} />
      )}
      {isEnabled(sections, 'members') && data?.members?.length > 0 && (
        <Members items={data.members} />
      )}
      {isEnabled(sections, 'locations') && data?.locations?.length > 0 && (
        <section className="py-10 bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4">
            <SectionTitle title={lang === 'en' ? 'Our locations' : 'Văn phòng của chúng tôi'} />
            <div className="grid md:grid-cols-3 gap-4">
              {data.locations.map((l) => (
                <div
                  key={l._id}
                  className="p-4 rounded-lg border border-gray-100 flex items-start gap-3"
                >
                  <FiMapPin className="text-primary flex-shrink-0 mt-1" size={18} />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{l.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{l.address}</p>
                    {l.phone && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <FiPhone size={10} /> {l.phone}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {isEnabled(sections, 'quoteSection') && data?.quoteSection && (
        <QuoteCTA quote={data.quoteSection} />
      )}
      <Stats stats={data?.stats} />
    </div>
  );
};

export default HomeAggregator;
