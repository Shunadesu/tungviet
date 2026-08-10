import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiX, FiPlus } from 'react-icons/fi';
import { useCompare } from '../context/CompareContext';
import publicApi from '../api/publicApi';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';
import EmptyState from '../components/EmptyState';
import { SUPPORTED_LOCALES } from '../i18n';
import { getLocalizedField } from '../utils/i18nField';
import placeholderProduct from '../assets/placeholder-product.svg';

const CompareProducts = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';
  const { items, removeFromCompare, clearCompare } = useCompare();
  const [hydrated, setHydrated] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      setHydrated([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all(
      items.map((it) =>
        publicApi
          .getProduct(it._id, lang)
          .then((res) => res?.data?.data || it)
          .catch(() => it)
      )
    ).then((fetched) => {
      if (!cancelled) {
        setHydrated(fetched.filter(Boolean));
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [items, lang]);

  const breadcrumb = useMemo(
    () => [
      { label: t('product.breadcrumbHome'), to: `/${lang}` },
      { label: t('nav.products'), to: `/${lang}/products` },
      { label: t('nav.compare') },
    ],
    [lang, t]
  );

  const fields = [
    { key: 'imageUrl', type: 'image' },
    { key: 'name', type: 'text', label: t('compare.fields.name') },
    { key: 'productCode', type: 'text', label: t('compare.fields.productCode') },
    {
      key: 'mainTree',
      type: 'tree',
      label: t('compare.fields.mainTree'),
    },
    {
      key: 'productLine',
      type: 'tree',
      label: t('compare.fields.productLine'),
    },
    {
      key: 'price',
      type: 'price',
      label: t('compare.fields.price'),
    },
    { key: 'softeningPoint', type: 'text', label: t('compare.fields.softeningPoint') },
    { key: 'acidValue', type: 'text', label: t('compare.fields.acidValue') },
    { key: 'color', type: 'text', label: t('compare.fields.color') },
    { key: 'applications', type: 'list', label: t('compare.fields.applications') },
    { key: 'benefits', type: 'list', label: t('compare.fields.benefits') },
    { key: 'targetAudience', type: 'text', label: t('compare.fields.targetAudience') },
  ];

  const renderValue = (product, field) => {
    const v = product[field.key];
    if (field.type === 'image') {
      return (
        <div className="w-full aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden">
          <img
            src={v || placeholderProduct}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = placeholderProduct;
            }}
          />
        </div>
      );
    }
    if (field.type === 'price') {
      if (product.priceVisible === false) return <span className="text-primary font-medium">{t('common.contactUs')}</span>;
      if (!v || Number(v) === 0) return <span className="text-gray-400">—</span>;
      return (
        <span className="font-semibold text-slate-900">
          {new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
          }).format(v)}
        </span>
      );
    }
    if (field.type === 'tree') {
      const obj = v;
      if (!obj) return <span className="text-gray-400">—</span>;
      const name = getLocalizedField(obj, lang, 'name', 'nameEn');
      return name || <span className="text-gray-400">—</span>;
    }
    if (field.type === 'list') {
      if (!Array.isArray(v) || v.length === 0) return <span className="text-gray-400">—</span>;
      return (
        <ul className="space-y-1 text-sm text-slate-700">
          {v.map((line, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-primary">•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      );
    }
    if (!v) return <span className="text-gray-400">—</span>;
    return <span className="text-sm text-slate-700">{v}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white min-h-screen"
    >
      <SEO
        title={t('compare.title')}
        description={t('compare.subtitle')}
        url={`/${lang}/products/compare`}
        breadcrumb={breadcrumb}
      />

      <PageHero
        breadcrumb={breadcrumb}
        title={t('compare.title')}
        subtitle={t('compare.subtitle')}
      />

      <section className="container-page py-10 md:py-14">
        {hydrated.length < 2 ? (
          <EmptyState
            icon={FiPlus}
            title={t('compare.empty')}
            description={t('compare.emptyHint')}
            action={
              <Link to={`/${lang}/products`} className="btn-primary inline-flex items-center gap-2">
                {t('common.viewAll')}
              </Link>
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-600">
                {t('compare.itemsSelected', { n: hydrated.length })}
              </p>
              <button
                type="button"
                onClick={clearCompare}
                className="text-sm text-rose-600 hover:text-rose-700 font-medium"
              >
                {t('wishlist.clearAll')}
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-card">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-slate-50 border-b border-r border-gray-200 px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[160px]">
                      Field
                    </th>
                    {hydrated.map((p) => (
                      <th
                        key={p._id}
                        className="border-b border-gray-200 px-4 py-4 text-left min-w-[220px] align-top"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/${lang}/products/${p._id}`}
                            className="text-sm font-semibold text-slate-900 hover:text-primary transition-colors line-clamp-2"
                          >
                            {getLocalizedField(p, lang, 'name', 'nameEn')}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCompare(p._id)}
                            aria-label={t('compare.remove')}
                            className="shrink-0 w-7 h-7 rounded-full bg-gray-100 hover:bg-rose-100 text-gray-500 hover:text-rose-600 flex items-center justify-center transition-colors"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, idx) => (
                    <tr key={field.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                      <th
                        scope="row"
                        className="sticky left-0 z-10 bg-inherit border-r border-gray-200 px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider align-top"
                      >
                        {field.label || t(`compare.fields.${field.key}`)}
                      </th>
                      {hydrated.map((p) => (
                        <td key={p._id} className="px-4 py-3 align-top">
                          {loading ? '...' : renderValue(p, field)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </motion.div>
  );
};

export default CompareProducts;
