import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

const CATEGORIES = [
  { name: 'Cây Cảnh Trong Nhà', nameEn: 'Indoor Ornamental Plants', description: 'Các loại cây cảnh phù hợp trồng trong nhà', descriptionEn: 'Various ornamental plants suitable for growing indoors', imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' },
  { name: 'Cây Cảnh Ngoài Trời', nameEn: 'Outdoor Ornamental Plants', description: 'Cây cảnh trồng ngoài vườn, sân', descriptionEn: 'Ornamental plants for garden and yard', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
  { name: 'Cây Ăn Quả', nameEn: 'Fruit Trees', description: 'Các loại cây cho trái ăn được', descriptionEn: 'Trees that produce edible fruits', imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400' },
  { name: 'Cây Hoa', nameEn: 'Flowering Plants', description: 'Cây hoa các loại', descriptionEn: 'All kinds of flowering plants', imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400' },
  { name: 'Phân Bón và Chăm Sóc', nameEn: 'Fertilizers and Plant Care', description: 'Phân bón, thuốc trừ sâu, dụng cụ chăm sóc', descriptionEn: 'Fertilizers, pesticides, and plant care tools', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' }
];

const PRODUCTS = [
  { name: 'Cây Kim Ngân', nameEn: 'Money Tree (Pachira)', description: 'Cây Kim Ngân là loại cây phong thủy được nhiều người ưa chuộng, mang lại tài lộc và may mắn. Dễ chăm sóc, phù hợp với không gian trong nhà.', descriptionEn: 'The Money Tree is a popular feng shui plant that brings wealth and good fortune. Easy to care for, perfect for indoor spaces.', price: 350000, stock: 50, categoryIndex: 0, imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' },
  { name: 'Cây Đại Tiện', nameEn: 'Aglaonema', description: 'Cây Đại Tiện hay còn gọi là cây Ngọc ngân, lá to tròn xanh tốt, mang lại không khí trong lành cho không gian sống.', descriptionEn: 'Aglaonema features large round green leaves, purifying the air and adding freshness to your living space.', price: 280000, stock: 45, categoryIndex: 0, imageUrl: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400' },
  { name: 'Cây Trầu Bà', nameEn: 'Golden Pothos', description: 'Cây Trầu Bà là loại cây leo, dễ trồng, có khả năng thanh lọc không khí tốt. Thích hợp trang trí ban công, giếng trời.', descriptionEn: 'Golden Pothos is a climbing plant that is easy to grow and has excellent air-purifying abilities. Great for balconies and skylights.', price: 150000, stock: 80, categoryIndex: 0, imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' },
  { name: 'Cây Lưỡi Hổ', nameEn: 'Snake Plant', description: 'Cây Lưỡi Hổ có lá cứng, mọc thẳng đứng, rất dễ chăm sóc. Cây có khả năng lọc không khí và hấp thụ formaldehyde.', descriptionEn: 'Snake Plant has sturdy upright leaves and is very low-maintenance. It purifies air and absorbs formaldehyde.', price: 220000, stock: 60, categoryIndex: 0, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
  { name: 'Cây Bàng Singapore', nameEn: 'Fiddle Leaf Fig', description: 'Cây Bàng Singapore có tán lá xanh mướt, thân thẳng đẹp mắt. Phù hợp trồng trong nhà với ánh sáng vừa phải.', descriptionEn: 'Fiddle Leaf Fig has lush green foliage and a beautiful upright trunk. Ideal for indoor spaces with moderate light.', price: 450000, stock: 35, categoryIndex: 0, imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400' },
  { name: 'Cây Cau Cảnh', nameEn: 'Areca Palm', description: 'Cây Cau Cảnh mang vẻ đẹp nhiệt đới, thích hợp trang trí phòng khách, văn phòng. Dễ chăm sóc và tăng cường oxy.', descriptionEn: 'Areca Palm brings a tropical vibe, perfect for living rooms and offices. Low-maintenance and boosts oxygen levels.', price: 380000, stock: 40, categoryIndex: 0, imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' },
  { name: 'Cây Phong Lan', nameEn: 'Orchid', description: 'Cây Phong Lan với hoa đẹp rực rỡ, thích hợp trang trí ban công, sân vườn. Nhiều màu sắc đa dạng.', descriptionEn: 'Orchids with vibrant beautiful blooms, ideal for decorating balconies and gardens. Available in many colors.', price: 520000, stock: 25, categoryIndex: 3, imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400' },
  { name: 'Cây Hồng Môn', nameEn: 'Anthurium', description: 'Cây Hồng Môn với hoa hình trái tim màu đỏ, hồng. Mang ý nghĩa tình yêu, hạnh phúc. Trồng trong nhà lọc không khí.', descriptionEn: 'Anthurium with red or pink heart-shaped flowers symbolizes love and happiness. Great indoor air purifier.', price: 480000, stock: 30, categoryIndex: 3, imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' },
  { name: 'Cây Cẩm Cù', nameEn: 'Hoya', description: 'Cây Cẩm Cù với lá dày, màu xanh bóng. Hoa nhỏ xinh đẹp. Cây có khả năng hấp thụ bức xạ điện tử tốt.', descriptionEn: 'Hoya has thick glossy green leaves and tiny beautiful flowers. The plant absorbs electronic radiation well.', price: 180000, stock: 55, categoryIndex: 0, imageUrl: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400' },
  { name: 'Cây Xương Rồng', nameEn: 'Cactus', description: 'Cây Xương Rồng nhiều loại, dễ chăm sóc, ít tưới nước. Phù hợp trang trí bàn làm việc, cửa sổ.', descriptionEn: 'Various cactus species, easy to care for, low water needs. Perfect for desks and windowsills.', price: 120000, stock: 100, categoryIndex: 0, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
  { name: 'Cây Nho', nameEn: 'Grape Vine', description: 'Cây Nho cho trái ngọt, có thể trồng trong vườn hoặc chậu lớn. Tạo bóng mát và thu hoạch quả.', descriptionEn: 'Grape vine produces sweet fruits and can be grown in gardens or large pots. Provides shade and harvest.', price: 850000, stock: 20, categoryIndex: 2, imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400' },
  { name: 'Cây Bưởi', nameEn: 'Pomelo Tree', description: 'Cây Bưởi cho trái to, nhiều nước. Trồng trong vườn mang lại bóng mát và trái cây sạch.', descriptionEn: 'Pomelo tree produces large juicy fruits. Planted in gardens for shade and clean home-grown fruit.', price: 680000, stock: 25, categoryIndex: 2, imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' },
  { name: 'Cây Mai Vàng', nameEn: 'Apricot Blossom', description: 'Cây Mai Vàng biểu tượng ngày Tết, hoa vàng rực rỡ. Trồng ngoài trời, cần nhiều ánh sáng.', descriptionEn: 'Apricot Blossom is the iconic Tet holiday flower with radiant yellow blooms. Grown outdoors with plenty of sunlight.', price: 1500000, stock: 15, categoryIndex: 3, imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400' },
  { name: 'Cây Tùng La Hán', nameEn: 'Buddhist Pine', description: 'Cây Tùng La Hán thân gỗ nhỏ, dáng đẹp. Thường trồng trong chậu trang trí, mang ý nghĩa trường thọ.', descriptionEn: 'Buddhist Pine is a small woody plant with a beautiful shape. Often potted for decoration, symbolizing longevity.', price: 950000, stock: 20, categoryIndex: 1, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
  { name: 'Phân Bón NPK', nameEn: 'NPK Fertilizer', description: 'Phân bón NPK cân đối dinh dưỡng cho cây trồng. Sử dụng cho cây cảnh, rau, hoa. Gói 1kg.', descriptionEn: 'Balanced NPK fertilizer for all plants. Suitable for ornamentals, vegetables, and flowers. 1kg package.', price: 85000, stock: 200, categoryIndex: 4, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
  { name: 'Đất Trồng Cây', nameEn: 'Potting Soil', description: 'Đất trồng cây chất lượng cao, giàu dinh dưỡng. Thích hợp cho cây cảnh, rau, hoa. Bao 5kg.', descriptionEn: 'High-quality nutrient-rich potting soil. Ideal for ornamentals, vegetables, and flowers. 5kg bag.', price: 65000, stock: 150, categoryIndex: 4, imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400' },
  { name: 'Cây Thiết Mộc Lan', nameEn: 'Dracaena', description: 'Cây Thiết Mộc Lan hay cây Đuôi Công, lá dài xanh bóng. Trồng trong nhà lọc không khí tốt.', descriptionEn: 'Dracaena has long glossy green leaves. Excellent indoor air purifier.', price: 320000, stock: 45, categoryIndex: 0, imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' },
  { name: 'Cây Sanh', nameEn: 'Ficus Bonsai', description: 'Cây Sanh bon sai phổ biến, thân gỗ đẹp, dáng cây tự nhiên. Trồng ngoài trời, cần tưới đều.', descriptionEn: 'Ficus Bonsai is a popular bonsai with beautiful wood trunk and natural shape. Grown outdoors with regular watering.', price: 2200000, stock: 10, categoryIndex: 1, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
  { name: 'Cây Hương Thảo', nameEn: 'Rosemary', description: 'Cây Hương Thảo thơm ngát, có thể trồng trong nhà hoặc ban công. Vừa làm cảnh vừa lấy lá gia vị.', descriptionEn: 'Rosemary has a lovely fragrance and can be grown indoors or on balconies. Decorative and useful as a culinary herb.', price: 95000, stock: 70, categoryIndex: 0, imageUrl: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400' },
  { name: 'Cây Sen Đá', nameEn: 'Succulent', description: 'Cây Sen Đá nhiều loại, lá mọng nước xếp đẹp. Dễ chăm sóc, phù hợp trang trí bàn, kệ.', descriptionEn: 'Various succulent species with beautifully arranged fleshy leaves. Easy to care for, perfect for desks and shelves.', price: 45000, stock: 120, categoryIndex: 0, imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' }
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    const admin = await User.create({
      name: 'Admin Zuna',
      email: 'admin@zuna.vn',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Created admin user:', admin.email);

    const categories = await Category.insertMany(CATEGORIES);
    console.log('Created categories:', categories.length);

    const productDocs = PRODUCTS.map((p) => ({
      name: p.name,
      nameEn: p.nameEn,
      description: p.description,
      descriptionEn: p.descriptionEn,
      price: p.price,
      stock: p.stock,
      categoryId: categories[p.categoryIndex]._id,
      imageUrl: p.imageUrl,
    }));
    const products = await Product.insertMany(productDocs);
    console.log('Created products:', products.length);

    console.log('\n=== Seed Data Complete ===');
    console.log('Admin login: admin@zuna.vn / admin123');
    console.log('=========================\n');

    process.exit();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();