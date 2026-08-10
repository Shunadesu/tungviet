import { sanitizeHtml } from '../../../utils/sanitize';

/**
 * Eyebrow tag - small uppercase text above title.
 *
 * Props:
 *  - text: string | { vi, en } - copy to render
 *  - lang: 'vi' | 'en' - current locale
 *  - textClass: string - tailwind text color class (defaults to white)
 */
const HeroEyebrow = ({ text, lang = 'vi', textClass = 'text-white' }) => {
  if (!text) return null;
  const value = typeof text === 'string' ? text : text?.[lang];
  if (!value) return null;

  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${textClass}/90 bg-white/10 backdrop-blur-sm rounded-full mb-3`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
    />
  );
};

export default HeroEyebrow;