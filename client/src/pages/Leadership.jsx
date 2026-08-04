import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import publicApi from '../api/publicApi';
import { SUPPORTED_LOCALES } from '../i18n';
import { sanitizeHtml } from '../utils/sanitize';

// ── Member Card ───────────────────────────────────────────────────────────────
function MemberCard({ member, lang, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      onClick={() => onClick(member)}
    >
      {/* Avatar */}
      <div className="flex justify-center pt-6 pb-2">
        <div className="relative">
          {member.imageUrl ? (
            <img
              src={member.imageUrl}
              alt={member.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gray-100 border-4 border-white shadow-md flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-400">
                {member.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="text-center px-4 pb-6">
        <h3 className="text-base font-bold text-gray-900 mb-0.5">{member.name}</h3>
        {member.position && (
          <p className="text-xs text-primary font-medium mb-3">{member.position}</p>
        )}
        {member.description && (
          <p
            className="text-xs text-gray-600 leading-relaxed line-clamp-3 [&_*]:inline"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(member.description) }}
          />
        )}
        <button className="mt-3 text-xs text-primary font-medium hover:underline">
          {lang === 'en' ? 'Read bio' : 'Xem tieu su'}
        </button>
      </div>
    </motion.div>
  );
}

// ── Bio Modal ────────────────────────────────────────────────────────────────
function BioModal({ member, lang, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl overflow-hidden max-w-lg w-full max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-primary/80 to-primary p-6 pb-16 text-center">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <FiX size={16} />
            </button>
            <div className="flex justify-center">
              {member.imageUrl ? (
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white/50 shadow-md -mt-14 mb-3"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/50 shadow-md -mt-14 mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {member.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold text-white">{member.name}</h3>
            {member.position && (
              <p className="text-sm text-white/80 mt-0.5">{member.position}</p>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {member.bio ? (
              <div
                className="text-sm text-gray-700 leading-relaxed space-y-3 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:pl-5 [&_li]:mb-1 [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(member.bio) }}
              />
            ) : (
              <p className="text-sm text-gray-400 text-center py-4 italic">
                {lang === 'en' ? 'No biography available.' : 'Chua co thong tin tieu su.'}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
const Leadership = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    publicApi.getLeadership()
      .then((res) => setMembers(res.data?.data?.members || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const heroTitle = lang === 'en' ? 'Leadership' : 'Leadership';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-16"
    >
      <SEO
        title={heroTitle}
        description={lang === 'en'
          ? 'Senior leadership team of Zuna Tungviet'
          : 'Doi ngu lanh dao cap cao Zuna Tungviet'}
        url={`/${lang}/about/leadership`}
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
            {lang === 'en'
              ? 'Meet our senior leadership team'
              : 'Gap mat doi ngu lanh dao cap cao'}
          </motion.p>
        </div>
      </section>

      {/* Members Grid */}
      <section className="max-w-4xl mx-auto px-4 -mt-10">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {t('leadership.noMembers')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {members.map((member) => (
              <MemberCard
                key={member._id}
                member={member}
                lang={lang}
                onClick={setSelected}
              />
            ))}
          </div>
        )}
      </section>

      {/* Bio Modal */}
      <AnimatePresence>
        {selected && (
          <BioModal
            member={selected}
            lang={lang}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Leadership;
