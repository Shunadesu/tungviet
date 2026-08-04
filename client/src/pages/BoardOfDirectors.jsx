import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import publicApi from '../api/publicApi';
import { SUPPORTED_LOCALES } from '../i18n';
import { sanitizeHtml } from '../utils/sanitize';
import { htmlToText } from '../utils/html';

const absoluteUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return url;
};

// ── Bio Modal ────────────────────────────────────────────────────────────────
function BioModal({ member, lang, onClose }) {
  if (!member) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 pb-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-gray-100 shadow-md">
              {member.imageUrl ? (
                <img
                  src={absoluteUrl(member.imageUrl)}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl text-gray-300">
                  ?
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-0.5">{member.name}</h3>
            {member.position && (
              <p className="text-sm text-primary font-medium">{member.position}</p>
            )}
          </div>

          {/* Bio */}
          {member.bio && (
            <div className="px-6 pb-6">
              <div
                className="text-sm text-gray-600 leading-relaxed text-left space-y-2 [&_p]:mb-2 [&_ul]:pl-5 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(member.bio) }}
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Member Card ──────────────────────────────────────────────────────────────
function MemberCard({ member, lang, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/20 cursor-pointer group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-gray-100">
        {member.imageUrl ? (
          <img
            src={absoluteUrl(member.imageUrl)}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
            ?
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 text-center">
        <h3 className="text-sm font-bold text-gray-900 mb-0.5">{member.name}</h3>
        {member.position && (
          <p className="text-xs text-primary font-medium mb-2">{member.position}</p>
        )}
        {member.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
            {htmlToText(member.description)}
          </p>
        )}
        <div className="mt-3">
          <span className="text-xs text-primary font-medium group-hover:underline">
            {lang === 'en' ? 'Read bio' : 'Xem tiểu sử'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
const BoardOfDirectors = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    publicApi.getMembers()
      .then((res) => setMembers(res.data?.data?.members || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const heroTitle = lang === 'en' ? t('boardOfDirectors.titleEn') : t('boardOfDirectors.title');
  const heroSubtitle = lang === 'en'
    ? 'Leadership team with dedication and experience'
    : 'Đội ngũ lãnh đạo tận tâm và giàu kinh nghiệm';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-16"
    >
      <SEO
        title={heroTitle}
        description={t('boardOfDirectors.description')}
        url={`/${lang}/about/board-of-directors`}
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
            ? 'Meet the experienced and dedicated leadership team of Zuna Tungviet, committed to delivering the highest quality industrial rosin products.'
            : 'Gặp gỡ đội ngũ lãnh đạo giàu kinh nghiệm và tận tâm của Tùng Việt, cam kết mang đến sản phẩm nhựa thông công nghiệp chất lượng cao nhất.'}
        </p>
      </div>

      {/* Members Grid */}
      <section className="max-w-4xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {t('boardOfDirectors.noMembers')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {members.map((member) => (
              <MemberCard
                key={member._id}
                member={member}
                lang={lang}
                onClick={() => setSelectedMember(member)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Bio Modal */}
      {selectedMember && (
        <BioModal
          member={selectedMember}
          lang={lang}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </motion.div>
  );
};

export default BoardOfDirectors;
