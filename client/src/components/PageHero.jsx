import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

/**
 * Banner hero dùng cho các trang con (Products list, Markets, About...).
 * Hỗ trợ breadcrumb, title, subtitle, background image hoặc gradient.
 */
const PageHero = ({
  title,
  subtitle,
  breadcrumb = [],
  background,
  align = 'left',
  children,
  className = '',
}) => {
  const isGradient = !background;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Background */}
      {background ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${background})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/85 via-primary-900/70 to-primary-900/50" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50/50">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
      )}

      <div className="relative container-page py-12 md:py-16 lg:py-20">
        {breadcrumb.length > 0 && (
          <nav
            className={`flex items-center gap-1.5 text-xs mb-5 ${
              background ? 'text-white/80' : 'text-gray-500'
            }`}
          >
            {breadcrumb.map((item, idx) => {
              const isLast = idx === breadcrumb.length - 1;
              return (
                <span key={idx} className="flex items-center gap-1.5">
                  {item.to && !isLast ? (
                    <Link
                      to={item.to}
                      className={`transition-colors hover:underline ${
                        background ? 'hover:text-white' : 'hover:text-primary'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        isLast
                          ? background
                            ? 'text-white font-medium'
                            : 'text-primary font-medium'
                          : ''
                      }
                    >
                      {item.label}
                    </span>
                  )}
                  {!isLast && <FiChevronRight size={12} />}
                </span>
              );
            })}
          </nav>
        )}

        <div className={align === 'center' ? 'text-center max-w-3xl mx-auto' : 'max-w-3xl'}>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className={`text-3xl md:text-4xl lg:text-display-lg font-bold tracking-tight ${
              background ? 'text-white' : 'text-slate-900'
            }`}
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`mt-4 text-base md:text-lg leading-relaxed ${
                background ? 'text-white/85' : 'text-slate-600'
              }`}
            >
              {subtitle}
            </motion.p>
          )}

          {children && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className={`mt-6 ${align === 'center' ? 'flex justify-center' : ''}`}
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default PageHero;