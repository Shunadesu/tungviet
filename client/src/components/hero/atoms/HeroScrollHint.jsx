import { useEffect, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

/**
 * Scroll hint - chevron-down with bounce animation at hero bottom.
 *
 * Props:
 *  - visible: boolean
 *  - textClass: tailwind color class (default 'text-white')
 */
const HeroScrollHint = ({ visible = true, textClass = 'text-white/80' }) => {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
  }, [visible]);

  if (!show) return null;

  return (
    <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 ${textClass}`}>
      <a
        href="#main-content"
        className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
        aria-label="Scroll down"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
        <FiChevronDown
          size={20}
          className="animate-bounce"
        />
      </a>
    </div>
  );
};

export default HeroScrollHint;