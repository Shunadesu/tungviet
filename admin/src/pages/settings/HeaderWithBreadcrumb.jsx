import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Header from '../../components/Header';

const HeaderWithBreadcrumb = ({ title, backTo = '/settings/appearance', backLabel = 'Cài đặt giao diện' }) => (
  <>
    <Header title={title} />
    <div className="px-4 pt-3 max-w-3xl">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors"
      >
        <FiArrowLeft size={12} />
        Quay lại {backLabel}
      </Link>
    </div>
  </>
);

export default HeaderWithBreadcrumb;