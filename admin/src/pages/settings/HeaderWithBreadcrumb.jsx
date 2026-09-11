import { Link } from 'react-router-dom';
import { FiArrowLeft, FiChevronRight } from 'react-icons/fi';
import Header from '../../components/Header';

const HeaderWithBreadcrumb = ({ 
  title, 
  backTo, 
  backLabel, 
  breadcrumbs,
  actions 
}) => {
  // Nếu có breadcrumbs hoặc actions, dùng layout phức tạp
  if (breadcrumbs || actions) {
    return (
      <>
        <Header title={title} />
        <div className="px-4 pt-3 flex items-center justify-between gap-3">
          {/* Breadcrumbs */}
          {breadcrumbs && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-1">
                  {crumb.path ? (
                    <Link
                      to={crumb.path}
                      className="hover:text-primary transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-700 font-medium">{crumb.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && <FiChevronRight size={12} />}
                </div>
              ))}
            </div>
          )}
          {/* Actions */}
          {actions && <div>{actions}</div>}
        </div>
      </>
    );
  }

  // Layout đơn giản với backTo
  return (
    <>
      <Header title={title} />
      {backTo && (
        <div className="px-4 pt-3 max-w-3xl">
          <Link
            to={backTo}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors"
          >
            <FiArrowLeft size={12} />
            Quay lại {backLabel || 'trang trước'}
          </Link>
        </div>
      )}
    </>
  );
};

export default HeaderWithBreadcrumb;