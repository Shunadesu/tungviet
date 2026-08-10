import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

let _id = 0;

const ICON_MAP = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
};

const COLOR_MAP = {
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  error: 'bg-rose-50 text-rose-800 border-rose-200',
  info: 'bg-sky-50 text-sky-800 border-sky-200',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message, opts = {}) => {
      const { type = 'info', duration = 2000 } = opts;
      const id = ++_id;
      setToasts((prev) => [...prev, { id, message, type }]);
      const timer = setTimeout(() => dismiss(id), duration);
      timersRef.current.set(id, timer);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      showToast,
      success: (msg, opts) => showToast(msg, { ...opts, type: 'success' }),
      error: (msg, opts) => showToast(msg, { ...opts, type: 'error' }),
      info: (msg, opts) => showToast(msg, { ...opts, type: 'info' }),
      dismiss,
    }),
    [showToast, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const Icon = ICON_MAP[toast.type] || FiInfo;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-lg text-sm font-medium min-w-[240px] max-w-sm ${COLOR_MAP[toast.type]}`}
                role="status"
              >
                <Icon size={16} className="shrink-0" />
                <span className="flex-1">{toast.message}</span>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Close"
                  className="opacity-60 hover:opacity-100 transition-opacity"
                >
                  <FiX size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Soft fallback so non-wrapped components don't crash — log only.
    return {
      showToast: (msg) => console.info('[toast]', msg),
      success: (msg) => console.info('[toast]', msg),
      error: (msg) => console.warn('[toast]', msg),
      info: (msg) => console.info('[toast]', msg),
      dismiss: () => {},
    };
  }
  return ctx;
};

export default ToastContext;
