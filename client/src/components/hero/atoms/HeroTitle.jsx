import { sanitizeHtml } from '../../../utils/sanitize';

const SIZE_CLASSES = {
  sm: 'text-2xl md:text-3xl lg:text-4xl',
  md: 'text-3xl md:text-4xl lg:text-5xl',
  lg: 'text-4xl md:text-5xl lg:text-6xl',
  xl: 'text-5xl md:text-6xl lg:text-7xl',
};

const DEFAULT_SIZE = 'lg';

/**
 * Hero title - supports rich HTML via sanitize + size scale.
 *
 * Props:
 *  - text: string | { vi, en }
 *  - lang: 'vi' | 'en'
 *  - size: 'sm' | 'md' | 'lg' | 'xl' (default 'lg')
 *  - textClass: tailwind class for color (default 'text-white')
 *  - align: 'center' | 'left' (default 'center')
 */
const HeroTitle = ({
  text,
  lang = 'vi',
  size = DEFAULT_SIZE,
  textClass = 'text-white',
  align = 'center',
}) => {
  if (!text) return null;
  const value = typeof text === 'string' ? text : text?.[lang];
  if (!value) return null;

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES[DEFAULT_SIZE];
  const alignClass = align === 'left' ? 'text-left' : 'text-center';

  return (
    <h1
      className={`${sizeClass} font-bold leading-tight drop-shadow-lg max-w-4xl ${alignClass} ${textClass}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
    />
  );
};

export default HeroTitle;