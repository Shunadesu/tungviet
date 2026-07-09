import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductSwiper = ({ products, title }) => {
  return (
    <div className="py-4">
      {title && (
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="section-title"
        >
          {title}
        </motion.h2>
      )}
      
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={16}
        slidesPerView={2}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
        }}
        className="pb-8"
      >
        {products.map((product, index) => (
          <SwiperSlide key={product._id}>
            <ProductCard product={product} index={index} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProductSwiper;
