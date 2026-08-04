import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const buildPageItems = (currentPage, totalPages, windowSize = 2) => {
  if (totalPages <= 1) return [1];
  const pages = [];
  const addPage = (n) => {
    if (n >= 1 && n <= totalPages && !pages.includes(n)) pages.push(n);
  };
  addPage(1);
  const start = Math.max(2, currentPage - windowSize);
  const end = Math.min(totalPages - 1, currentPage + windowSize);
  if (start > 2) pages.push('ellipsis-left');
  for (let i = start; i <= end; i++) addPage(i);
  if (end < totalPages - 1) pages.push('ellipsis-right');
  addPage(totalPages);
  return pages;
};

const Pagination = ({ currentPage, totalPages, onPageChange, windowSize = 2 }) => {
  if (!totalPages || totalPages <= 1) return null;

  const items = buildPageItems(currentPage, totalPages, windowSize);
  const goPrev = () => onPageChange(Math.max(1, currentPage - 1));
  const goNext = () => onPageChange(Math.min(totalPages, currentPage + 1));

  const baseBtn =
    'inline-flex items-center justify-center min-w-[36px] h-9 px-2.5 text-sm font-medium rounded-lg transition-colors duration-150';
  const navBtn = `${baseBtn} bg-white border border-gray-200 text-slate-700 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-slate-700`;

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 mt-10"
    >
      <button
        type="button"
        onClick={goPrev}
        disabled={currentPage === 1}
        className={navBtn}
        aria-label="Previous page"
      >
        <FiChevronLeft size={16} />
      </button>

      <div className="hidden sm:flex items-center gap-1.5">
        {items.map((item) => {
          if (typeof item === 'string') {
            return (
              <span
                key={item}
                className="inline-flex items-center justify-center min-w-[36px] h-9 text-sm text-slate-400"
              >
                …
              </span>
            );
          }
          const isActive = item === currentPage;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`${baseBtn} ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-slate-700 hover:border-primary hover:text-primary'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item}
            </button>
          );
        })}
      </div>

      <span className="sm:hidden inline-flex items-center px-3 h-9 text-sm font-medium text-slate-700 bg-white border border-gray-200 rounded-lg">
        {currentPage} / {totalPages}
      </span>

      <button
        type="button"
        onClick={goNext}
        disabled={currentPage === totalPages}
        className={navBtn}
        aria-label="Next page"
      >
        <FiChevronRight size={16} />
      </button>
    </nav>
  );
};

export default Pagination;