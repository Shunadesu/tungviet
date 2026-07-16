import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import publicApi from '../api/publicApi';

const PartnersSection = () => {
  const { t, i18n } = useTranslation();
  const [partners, setPartners] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    publicApi.getPartners('partner')
      .then((res) => setPartners(res.data?.data || []))
      .catch(() => {});
    publicApi.getPartners('customer')
      .then((res) => setCustomers(res.data?.data || []))
      .catch(() => {});
  }, []);

  if (partners.length === 0 && customers.length === 0) return null;

  return (
    <section className="bg-white py-14">
      <div className="max-w-6xl mx-auto px-4">
        {partners.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
              {i18n.language === 'en' ? 'Our Partners' : 'Đối tác'}
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {partners.map((item) => (
                <a
                  key={item._id}
                  href={item.website || '#'}
                  target={item.website ? '_blank' : undefined}
                  rel={item.website ? 'noopener noreferrer' : undefined}
                  className="flex items-center justify-center w-28 h-20 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                  title={item.name}
                >
                  {item.logo ? (
                    <img src={item.logo} alt={item.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-sm text-gray-400">{item.name}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {customers.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
              {i18n.language === 'en' ? 'Our Customers' : 'Khách hàng'}
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {customers.map((item) => (
                <a
                  key={item._id}
                  href={item.website || '#'}
                  target={item.website ? '_blank' : undefined}
                  rel={item.website ? 'noopener noreferrer' : undefined}
                  className="flex items-center justify-center w-28 h-20 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                  title={item.name}
                >
                  {item.logo ? (
                    <img src={item.logo} alt={item.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-sm text-gray-400">{item.name}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PartnersSection;
