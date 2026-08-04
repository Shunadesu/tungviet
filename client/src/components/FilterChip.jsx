import { FiCheck, FiX } from 'react-icons/fi';

/**
 * Chip filter có thể toggle (active/inactive).
 */
const FilterChip = ({ label, active = false, onClick, onRemove, count }) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
        active
          ? 'bg-primary text-white border-primary shadow-sm'
          : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
      }`}
    >
      {active && <FiCheck size={12} />}
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-primary-50'
          }`}
        >
          {count}
        </span>
      )}
      {active && onRemove && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onRemove();
            }
          }}
          className="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-white/20"
        >
          <FiX size={12} />
        </span>
      )}
    </button>
  );
};

export default FilterChip;