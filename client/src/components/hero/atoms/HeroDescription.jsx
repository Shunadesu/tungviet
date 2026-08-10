import { sanitizeHtml } from '../../../utils/sanitize';

const SIZE_CLASSES = {
  sm: 'text-sm md:text-base',
  md: 'text-base md:text-lg',
  lg: 'text-base md:text-xl',
};

const DEFAULT_SIZE = 'lg';

/**
 * Hero description - rich HTML via sanitize + size scale.
 *
 * Props:
 *  - text: string | { vi, en }
 *  - lang: 'vi' | 'en'
 *  - size: 'sm' | 'md' | 'lg'
 *  - textClass: tailwind color class
 *  - maxWidth: tailwind max-width class (default 'max-w-3xl')
 */
const HeroDescription = ({
  text,
  lang = 'vi',
  size = DEFAULT_SIZE,
  textClass = 'text-white/90',
  maxWidth = 'max-w-3xl',
}) => {
  if (!text) return null;
  const value = typeof text === 'string' ? text : text?.[lang];
  if (!value) return null;

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES[DEFAULT_SIZE];

  return (
    <p
      className={`${sizeClass} ${textClass} ${maxWidth} drop-shadow leading-relaxed`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
    />
  );
};

export default HeroDescription;