import { FiLoader, FiChevronDown } from 'react-icons/fi';

/**
 * "Load more" pagination trigger. Returns null when there is nothing more to load.
 * Shows a centered button + a small status line ("Showing X of Y").
 */
const LoadMore = ({ hasMore, loading, onLoad, total, shown, label }) => {
  if (!hasMore && !loading) {
    if (total && shown && shown >= total) {
      return (
        <p className="mt-10 text-center text-xs text-gray-400">
          {`— ${shown} / ${total} —`}
        </p>
      );
    }
    return null;
  }

  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={onLoad}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-card"
      >
        {loading ? (
          <>
            <FiLoader size={14} className="animate-spin" />
            ...
          </>
        ) : (
          <>
            <FiChevronDown size={14} />
            {label || 'Load more'}
          </>
        )}
      </button>
      {total != null && shown != null && (
        <p className="text-xs text-gray-400">
          {shown} / {total}
        </p>
      )}
    </div>
  );
};

export default LoadMore;
