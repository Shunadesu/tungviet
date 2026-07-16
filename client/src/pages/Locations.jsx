import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import publicApi from '../api/publicApi';
import { SUPPORTED_LOCALES } from '../i18n';

// ── Location Card ─────────────────────────────────────────────────────────────
function LocationCard({ location, lang }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm"
    >
      {/* Map Embed */}
      {location.mapEmbed && (
        <div className="w-full" style={{ aspectRatio: '16/9' }}>
          <iframe
            src={location.mapEmbed}
            width="100%"
            height="100%"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={location.name}
          />
        </div>
      )}

      {/* Info */}
      <div className="p-5">
        <h3 className="text-base font-bold text-gray-900 mb-1">{location.name}</h3>
        {location.address && (
          <div className="flex items-start gap-2 text-sm text-gray-500 mb-2">
            <FiMapPin size={14} className="mt-0.5 shrink-0 text-primary" />
            <span>{location.address}</span>
          </div>
        )}

        {location.description && (
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            {location.description}
          </p>
        )}

        {/* Contact */}
        <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100">
          {location.phone && (
            <a
              href={`tel:${location.phone}`}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-primary transition-colors"
            >
              <FiPhone size={13} />
              {location.phone}
            </a>
          )}
          {location.email && (
            <a
              href={`mailto:${location.email}`}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-primary transition-colors"
            >
              <FiMail size={13} />
              {location.email}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
const Locations = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getLocations()
      .then((res) => setLocations(res.data?.data?.locations || []))
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, []);

  const heroTitle = lang === 'en' ? t('locations.titleEn') : t('locations.title');
  const heroSubtitle = lang === 'en'
    ? 'Find our offices and distribution centers nationwide'
    : 'Tim cac van phong va trung tam phan phoi tren toan quoc';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-16"
    >
      <SEO
        title={heroTitle}
        description={t('locations.description')}
        url={`/${lang}/about/locations`}
      />

      {/* Hero */}
      <section className="relative w-full h-[50vh] min-h-[300px] bg-gradient-to-br from-primary/80 via-primary to-primary/90 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.2) 0%, transparent 50%)',
            backgroundSize: '100% 100%',
          }}
        />
        <div className="relative z-10 text-center text-white px-6 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg"
          >
            {heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-white/90"
          >
            {heroSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Description */}
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-sm text-gray-600 leading-relaxed">
          {lang === 'en'
            ? 'With a widespread network of offices and distribution centers, Zuna Tungviet ensures prompt delivery and professional consultation services for customers nationwide.'
            : 'Voi mang luoi van phong va trung tam phan phoi rong rai, Zuna Tungviet dam bao giao hang nhanh chong va tu van chuyen nghiep den khach hang toan quoc.'}
        </p>
      </div>

      {/* Locations Grid */}
      <section className="max-w-4xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {t('locations.noLocations')}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {locations.map((location) => (
              <LocationCard
                key={location._id}
                location={location}
                lang={lang}
              />
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default Locations;
