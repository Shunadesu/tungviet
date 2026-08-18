import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FiSearch,
  FiX,
  FiClock,
  FiArrowRight,
  FiCornerDownLeft,
  FiTrash2,
  FiTrendingUp,
  FiBox,
} from 'react-icons/fi';
import publicApi from '../api/publicApi';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { SUPPORTED_LOCALES } from '../i18n';
import { getLocalizedField } from '../utils/i18nField';
import placeholderProduct from '../assets/placeholder-product.svg';

const MAX_SUGGESTIONS = 6;
const MIN_QUERY = 2;

// The modal must sit above EVERYTHING — floating chat widgets, header, compare bar.
// Using a six-digit z-index guarantees we win against any third-party widget that
// uses z-9999 or z-[1000] etc.
const MODAL_Z = 2147483000; // near max safe 32-bit int; not Int32 max to avoid paranoia

const lockBodyScroll = () => {
  if (typeof document === 'undefined') return () => {};
  const prevOverflow = document.body.style.overflow;
  const prevPaddingRight = document.body.style.paddingRight;
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
  return () => {
    document.body.style.overflow = prevOverflow;
    document.body.style.paddingRight = prevPaddingRight;
  };
};

/**
 * Full-screen search modal. Triggered by header search icon and the Cmd+K / Ctrl+K
 * shortcut. Rendered through a portal directly into <body> to defeat any
 * parent stacking context (transform / filter / will-change).
 */
const SearchModal = ({ open, onClose, lang }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [marketMatches, setMarketMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { recents, addRecent, removeRecent, clearRecents } = useRecentSearches();

  // Body scroll lock + ESC handler
  useEffect(() => {
    if (!open) return undefined;
    const unlock = lockBodyScroll();
    return unlock;
  }, [open]);

  // Reset + auto-focus on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setDebounced('');
      setSuggestions([]);
      setMarketMatches([]);
      setActiveIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  // Debounce query → debounced (300ms)
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(handle);
  }, [query]);

  // Fetch suggestions + relevant markets when debounced changes
  useEffect(() => {
    if (!open) return;
    if (debounced.length < MIN_QUERY) {
      setSuggestions([]);
      setMarketMatches([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const lower = debounced.toLowerCase();

    // Kick off both fetches in parallel
    const productsP = publicApi
      .getProducts({ lang, search: debounced, limit: MAX_SUGGESTIONS })
      .then((res) => {
        if (cancelled) return [];
        const items = Array.isArray(res.data?.data) ? res.data.data : [];
        setSuggestions(items);
        return items;
      })
      .catch((err) => {
        if (cancelled) return [];
        console.warn('[SearchModal] suggestion fetch failed:', err);
        setSuggestions([]);
        return [];
      });

    const marketsP = publicApi
      .getMarketTrees({ lang })
      .then((res) => {
        if (cancelled) return [];
        const items = Array.isArray(res.data?.data) ? res.data.data : [];
        // Client-side filter by title/titleEn — backend doesn't expose a
        // search query on /public/market-trees.
        const matches = items
          .filter((m) => {
            const vi = (m.title || '').toLowerCase();
            const en = (m.titleEn || '').toLowerCase();
            return vi.includes(lower) || en.includes(lower);
          })
          .slice(0, 3);
        setMarketMatches(matches);
        return matches;
      })
      .catch((err) => {
        if (cancelled) return [];
        console.warn('[SearchModal] markets fetch failed:', err);
        setMarketMatches([]);
        return [];
      });

    Promise.allSettled([productsP, marketsP]).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [debounced, lang, open]);

  const goSearch = (term) => {
    const cleaned = (term ?? query).trim();
    if (!cleaned) return;
    addRecent(cleaned);
    onClose();
    navigate(`/${lang}/products?q=${encodeURIComponent(cleaned)}`);
  };

  const handleSelectSuggestion = (product) => {
    if (!product || !product._id) return;
    addRecent(query.trim() || product.name);
    onClose();
    navigate(`/${lang}/products/${product._id}`);
  };

  const handleSelectMarket = (market) => {
    if (!market || !market._id) return;
    addRecent(query.trim() || market.title || market.titleEn || '');
    onClose();
    navigate(`/${lang}/markets/${market._id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
      return;
    }
    if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[activeIndex]);
      }
    }
  };

  const showRecents = debounced.length < MIN_QUERY && recents.length > 0;
  const showEmpty = debounced.length < MIN_QUERY && recents.length === 0;
  const showNoResults =
    debounced.length >= MIN_QUERY &&
    !loading &&
    suggestions.length === 0 &&
    marketMatches.length === 0;

  const trending = useMemo(
    () => [
      { label: t('search.trendingHotmelt'), q: 'hot melt' },
      { label: t('search.trendingRosin'), q: 'rosin' },
      { label: t('search.trendingAdhesive'), q: 'adhesive' },
    ],
    [t]
  );

  // SSR-safety: only create portal in the browser
  if (typeof document === 'undefined') return null;

  const modal = (
    <AnimatePresence>
      {open && (
        <div
          // Plain div wrapper (NOT motion.div) so we don't auto-create a stacking
          // context that could clip our own descendants. The wrapper itself uses
          // position:fixed + inset:0 and inline style for z-index.
          key="search-modal-root"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: MODAL_Z,
            isolation: 'isolate', // creates a new stacking context just for us
          }}
          role="dialog"
          aria-modal="true"
          aria-label={t('common.search')}
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop — solid scrim, NOT click-through. Sits on the very first
              stacking layer so nothing beneath the modal can be tapped. */}
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close search"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: 0,
              padding: 0,
              cursor: 'default',
            }}
          />

          {/* Panel — positioned absolutely so it never expands the wrapper's
              bounding box and never collides with a parent flex layout. */}
          <motion.div
            initial={{ y: -24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            style={{
              position: 'relative',
              margin: '0 auto',
              marginTop: 'min(80px, 10vh)',
              width: 'calc(100% - 24px)',
              maxWidth: '640px',
              maxHeight: 'calc(100vh - min(160px, 20vh))',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Input row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                flexShrink: 0,
              }}
            >
              <FiSearch size={20} color="#94a3b8" style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                placeholder={t('search.placeholder')}
                aria-label={t('common.search')}
                autoComplete="off"
                maxLength={120}
                style={{
                  flex: 1,
                  fontSize: '17px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#0f172a',
                  minWidth: 0,
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  aria-label={t('common.clearSearch')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    fontSize: '12px',
                  }}
                >
                  <FiX size={16} />
                </button>
              )}
              <kbd
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '10px',
                  fontFamily: 'ui-monospace, monospace',
                  color: '#94a3b8',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '2px 6px',
                }}
              >
                ESC
              </kbd>
            </div>

            {/* Body — scrollable */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {showRecents && (
                <Section title={t('search.recent')} action={
                  <button
                    type="button"
                    onClick={clearRecents}
                    style={{
                      fontSize: '11px',
                      color: '#94a3b8',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <FiTrash2 size={11} />
                    {t('search.clear')}
                  </button>
                }>
                  {recents.map((term, i) => (
                    <div
                      key={`${term}-${i}`}
                      style={{ position: 'relative' }}
                    >
                      <button
                        type="button"
                        onClick={() => goSearch(term)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 20px',
                          background: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: '#334155',
                          fontSize: '14px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <FiClock size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {term}
                        </span>
                        <FiArrowRight size={12} color="#cbd5e1" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecent(term);
                        }}
                        aria-label="Remove"
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.7,
                        }}
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </Section>
              )}

              {debounced.length < MIN_QUERY && (
                <Section title={t('search.trending')} icon={FiTrendingUp}>
                  <div style={{ padding: '0 20px 16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {trending.map((t2) => (
                      <button
                        key={t2.q}
                        type="button"
                        onClick={() => goSearch(t2.q)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '999px',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <FiTrendingUp size={11} />
                        {t2.label}
                      </button>
                    ))}
                  </div>
                </Section>
              )}

              {loading && (
                <div style={{ padding: '24px 20px', fontSize: '14px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: '2px solid #3b82f6',
                      borderTopColor: 'transparent',
                      animation: 'search-modal-spin 0.7s linear infinite',
                    }}
                  />
                  {t('common.loading')}
                </div>
              )}

              {!loading && suggestions.length > 0 && (
                <Section title={t('search.suggestions')} icon={FiSearch}>
                  <ul role="listbox" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {suggestions.map((p, idx) => (
                      <li key={p._id} role="option" aria-selected={activeIndex === idx}>
                        <button
                          type="button"
                          onClick={() => handleSelectSuggestion(p)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 20px',
                            background: activeIndex === idx ? '#eff6ff' : 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'background 0.12s',
                          }}
                        >
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              background: '#f8fafc',
                              overflow: 'hidden',
                              flexShrink: 0,
                              border: '1px solid #f1f5f9',
                            }}
                          >
                            <img
                              src={p.imageUrl || placeholderProduct}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.currentTarget.src = placeholderProduct;
                              }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#0f172a',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {highlight(p.name, debounced)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              {p.productCode && (
                                <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'ui-monospace, monospace' }}>
                                  {p.productCode}
                                </span>
                              )}
                              {Array.isArray(p.industries) && p.industries.length > 0 && (
                                <span style={{ fontSize: '11px', color: '#64748b' }}>
                                  · {getLocalizedField(p.industries[0], lang, 'name', 'nameEn')}
                                </span>
                              )}
                            </div>
                          </div>
                          {activeIndex === idx && (
                            <FiCornerDownLeft size={12} color="#3b82f6" style={{ flexShrink: 0 }} />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {!loading && marketMatches.length > 0 && (
                <Section title={t('search.relevantMarkets')} icon={FiBox}>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {marketMatches.map((m) => {
                      const name = getLocalizedField(m, lang, 'title', 'titleEn');
                      const description = getLocalizedField(
                        m,
                        lang,
                        'description',
                        'descriptionEn'
                      );
                      return (
                        <li key={m._id}>
                          <button
                            type="button"
                            onClick={() => handleSelectMarket(m)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 20px',
                              background: 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              color: '#334155',
                              fontSize: '14px',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: '#ecfeff',
                                color: '#0891b2',
                                flexShrink: 0,
                              }}
                            >
                              <FiBox size={14} />
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  color: '#0f172a',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {highlight(name, debounced)}
                              </div>
                              {description && (
                                <div
                                  style={{
                                    fontSize: '11px',
                                    color: '#94a3b8',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {description}
                                </div>
                              )}
                            </div>
                            <FiArrowRight size={12} color="#cbd5e1" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </Section>
              )}

              {showNoResults && (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <FiSearch size={28} color="#cbd5e1" style={{ display: 'block', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                    {t('search.noResults', { q: debounced })}
                  </p>
                </div>
              )}

              {showEmpty && (
                <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: '14px', color: '#94a3b8' }}>
                  {t('search.typeToSearch')}
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div
              style={{
                borderTop: '1px solid #f1f5f9',
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#94a3b8',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <kbd style={kbdStyle}>↑</kbd>
                  <kbd style={kbdStyle}>↓</kbd>
                  {t('search.navigate')}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <kbd style={kbdStyle}>↵</kbd>
                  {t('search.select')}
                </span>
              </div>
              <span style={{ display: window.innerWidth >= 640 ? 'inline' : 'none' }}>
                {t('search.poweredBy')}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
};

const kbdStyle = {
  fontFamily: 'ui-monospace, monospace',
  border: '1px solid #e2e8f0',
  borderRadius: '4px',
  padding: '0 4px',
  fontSize: '10px',
  color: '#94a3b8',
};

const Section = ({ title, icon: Icon, action, children }) => (
  <div style={{ padding: '8px 0' }}>
    <div
      style={{
        padding: '8px 20px 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <h3
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          margin: 0,
        }}
      >
        {Icon && <Icon size={11} />}
        {title}
      </h3>
      {action}
    </div>
    {children}
  </div>
);

/**
 * Highlight matching substring in the suggestion label.
 */
const highlight = (text, query) => {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: '#fef9c3',
          color: '#0f172a',
          borderRadius: '3px',
          padding: '0 2px',
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
};

export default SearchModal;
