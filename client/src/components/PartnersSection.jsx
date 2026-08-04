import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import publicApi from '../api/publicApi';
import SectionHeader from './SectionHeader';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const LogoItem = ({ item }) => (
  <motion.a
    variants={itemVariants}
    whileHover={{ scale: 1.06 }}
    href={item.website || '#'}
    target={item.website ? '_blank' : undefined}
    rel={item.website ? 'noopener noreferrer' : undefined}
    className="flex items-center justify-center w-28 h-20 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 rounded-xl hover:ring-1 hover:ring-primary-100 hover:bg-white"
    title={item.name}
  >
    {item.logo ? (
      <img src={item.logo} alt={item.name} className="max-w-full max-h-full object-contain" />
    ) : (
      <span className="text-sm text-gray-400">{item.name}</span>
    )}
  </motion.a>
);

const PartnersSection = () => {
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === 'en';
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
    <section className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        {partners.length > 0 && (
          <div className="mb-12">
            <SectionHeader
              eyebrow={isEN ? 'Collaboration' : 'Hợp tác'}
              title={isEN ? 'Our Partners' : 'Đối tác'}
              align="center"
              className="mb-8"
            />
            <motion.div
              className="flex flex-wrap justify-center items-center gap-6 md:gap-10"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
            >
              {partners.map((item) => (
                <LogoItem key={item._id} item={item} />
              ))}
            </motion.div>
          </div>
        )}

        {customers.length > 0 && (
          <div>
            <SectionHeader
              eyebrow={isEN ? 'Trusted by' : 'Khách hàng'}
              title={isEN ? 'Our Customers' : 'Khách hàng'}
              align="center"
              className="mb-8"
            />
            <motion.div
              className="flex flex-wrap justify-center items-center gap-6 md:gap-10"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
            >
              {customers.map((item) => (
                <LogoItem key={item._id} item={item} />
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PartnersSection;