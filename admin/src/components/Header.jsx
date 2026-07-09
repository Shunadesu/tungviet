import { Link } from 'react-router-dom';
import { GiPlantRoots } from 'react-icons/gi';

const Header = ({ title }) => {
  return (
    <header className="bg-white border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-primary">{title}</h1>
        <Link 
          to={import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000'} 
          target="_blank"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <GiPlantRoots size={14} />
          Xem website
        </Link>
      </div>
    </header>
  );
};

export default Header;
