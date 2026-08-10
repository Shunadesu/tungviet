import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

/**
 * CTA group - renders up to 2 buttons (primary + secondary).
 *
 * Props:
 *  - primary: { label: {vi,en}, href, style } | null
 *  - secondary: same shape | null
 *  - lang: 'vi' | 'en'
 *  - theme: 'light' | 'dark' - text color theme
 */
const HeroCTAGroup = ({ primary, secondary, lang = 'vi', theme = 'dark' }) => {
  const isLight = theme === 'light';

  const renderButton = (cta) => {
    if (!cta?.label) return null;
    const label = cta.label?.[lang] || cta.label?.vi || cta.label?.en;
    if (!label) return null;
    const href = cta.href || '#';
    const style = cta.style || 'solid';
    const baseClass =
      'inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm md:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary';

    const styleClass = (() => {
      if (style === 'outline') {
        return isLight
          ? 'border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'
          : 'border-2 border-white text-white hover:bg-white hover:text-slate-900';
      }
      if (style === 'ghost') {
        return isLight
          ? 'text-slate-900 hover:bg-slate-900/10'
          : 'text-white hover:bg-white/10';
      }
      // solid default
      return 'bg-primary text-white hover:bg-primary-700 shadow-lg hover:shadow-xl';
    })();

    const isInternal = href.startsWith('/');
    const content = (
      <>
        {label}
        <FiArrowRight />
      </>
    );

    return isInternal ? (
      <Link to={href} className={`${baseClass} ${styleClass}`}>
        {content}
      </Link>
    ) : (
      <a
        href={href}
        className={`${baseClass} ${styleClass}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  };

  const primaryBtn = renderButton(primary);
  const secondaryBtn = renderButton(secondary);
  if (!primaryBtn && !secondaryBtn) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
      {primaryBtn}
      {secondaryBtn}
    </div>
  );
};

export default HeroCTAGroup;