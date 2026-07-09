import { GiPlantRoots, GiTreeBranch, GiLeaf } from 'react-icons/gi';
import { motion } from 'framer-motion';

const features = [
  { icon: <GiPlantRoots size={32} />, title: 'Cây Chất Lượng', desc: '100% cây khỏe mạnh, nguồn gốc rõ ràng' },
  { icon: <GiTreeBranch size={32} />, title: 'Giao Hàng Nhanh', desc: 'Giao trong 24h nội thành' },
  { icon: <GiLeaf size={32} />, title: 'Chăm Sóc Tận Tâm', desc: 'Tư vấn chăm sóc cây miễn phí' },
];

const Banner = () => {
  return (
    <div className="relative bg-gradient-to-r from-primary to-primary-light text-white py-12 overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 opacity-10">
        <GiPlantRoots className="absolute -right-10 -top-10" size={200} />
        <GiTreeBranch className="absolute -left-10 bottom-0" size={150} />
      </div>

      <div className="max-w-7xl mx-auto px-2 relative">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-3">
              Mang Thiên Nhiên<br />Đến Ngôi Nhà Bạn
            </h1>
            <p className="text-sm text-white/80 mb-4 max-w-md">
              Khám phá bộ sưu tập cây cảnh đa dạng, từ cây trong nhà đến cây ngoài trời. 
              Chúng tôi cam kết mang đến những sản phẩm chất lượng nhất.
            </p>
            <a href="/products" className="inline-block bg-white text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors">
              Xem sản phẩm
            </a>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-3 gap-3"
          >
            {features.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white/10 backdrop-blur rounded-lg p-3 text-center"
              >
                <div className="mb-2 flex justify-center">{item.icon}</div>
                <h3 className="text-xs font-medium mb-1">{item.title}</h3>
                <p className="text-xs text-white/70">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
