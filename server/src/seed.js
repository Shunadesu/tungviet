import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin Zuna',
      email: 'admin@zuna.vn',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Created admin user:', admin.email);

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Cây Cảnh Trong Nhà', description: 'Các loại cây cảnh phù hợp trồng trong nhà', imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' },
      { name: 'Cây Cảnh Ngoài Trời', description: 'Cây cảnh trồng ngoài vườn, sân', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
      { name: 'Cây Ăn Quả', description: 'Các loại cây cho trái ăn được', imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400' },
      { name: 'Cây Hoa', description: 'Cây hoa các loại', imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400' },
      { name: 'Phân Bón & Chăm Sóc', description: 'Phân bón, thuốc trừ sâu, dụng cụ chăm sóc', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' }
    ]);
    console.log('Created categories:', categories.length);

    // Create products
    const products = await Product.insertMany([
      { name: 'Cây Kim Ngân', description: 'Cây Kim Ngân là loại cây phong thủy được nhiều người ưa chuộng, mang lại tài lộc và may mắn. Dễ chăm sóc, phù hợp với không gian trong nhà.', price: 350000, stock: 50, categoryId: categories[0]._id, imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' },
      { name: 'Cây Đại Tiện', description: 'Cây Đại Tiện hay còn gọi là cây Ngọc ngân, lá to tròn xanh tốt, mang lại không khí trong lành cho không gian sống.', price: 280000, stock: 45, categoryId: categories[0]._id, imageUrl: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400' },
      { name: 'Cây Trầu Bà', description: 'Cây Trầu Bà là loại cây leo, dễ trồng, có khả năng thanh lọc không khí tốt. Thích hợp trang trí ban công, giếng trời.', price: 150000, stock: 80, categoryId: categories[0]._id, imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' },
      { name: 'Cây Lưỡi Hổ', description: 'Cây Lưỡi Hổ có lá cứng, mọc thẳng đứng, rất dễ chăm sóc. Cây có khả năng lọc không khí và hấp thụ formaldehyde.', price: 220000, stock: 60, categoryId: categories[0]._id, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
      { name: 'Cây Bàng Singapore', description: 'Cây Bàng Singapore có tán lá xanh mướt, thân thẳng đẹp mắt. Phù hợp trồng trong nhà với ánh sáng vừa phải.', price: 450000, stock: 35, categoryId: categories[0]._id, imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400' },
      { name: 'Cây Cau Cảnh', description: 'Cây Cau Cảnh mang vẻ đẹp nhiệt đới, thích hợp trang trí phòng khách, văn phòng. Dễ chăm sóc và tăng cường oxy.', price: 380000, stock: 40, categoryId: categories[0]._id, imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' },
      { name: 'Cây Phong Lan', description: 'Cây Phong Lan với hoa đẹp rực rỡ, thích hợp trang trí ban công, sân vườn. Nhiều màu sắc đa dạng.', price: 520000, stock: 25, categoryId: categories[3]._id, imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400' },
      { name: 'Cây Hồng Môn', description: 'Cây Hồng Môn với hoa hình trái tim màu đỏ, hồng. Mang ý nghĩa tình yêu, hạnh phúc. Trồng trong nhà lọc không khí.', price: 480000, stock: 30, categoryId: categories[3]._id, imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' },
      { name: 'Cây Cẩm Cù', description: 'Cây Cẩm Cù với lá dày, màu xanh bóng. Hoa nhỏ xinh đẹp. Cây có khả năng hấp thụ bức xạ điện tử tốt.', price: 180000, stock: 55, categoryId: categories[0]._id, imageUrl: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400' },
      { name: 'Cây Xương Rồng', description: 'Cây Xương Rồng nhiều loại, dễ chăm sóc, ít tưới nước. Phù hợp trang trí bàn làm việc, cửa sổ.', price: 120000, stock: 100, categoryId: categories[0]._id, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
      { name: 'Cây Nho', description: 'Cây Nho cho trái ngọt, có thể trồng trong vườn hoặc chậu lớn. Tạo bóng mát và thu hoạch quả.', price: 850000, stock: 20, categoryId: categories[2]._id, imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400' },
      { name: 'Cây Bưởi', description: 'Cây Bưởi cho trái to, nhiều nước. Trồng trong vườn mang lại bóng mát và trái cây sạch.', price: 680000, stock: 25, categoryId: categories[2]._id, imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' },
      { name: 'Cây Mai Vàng', description: 'Cây Mai Vàng biểu tượng ngày Tết, hoa vàng rực rỡ. Trồng ngoài trời, cần nhiều ánh sáng.', price: 1500000, stock: 15, categoryId: categories[3]._id, imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400' },
      { name: 'Cây Tùng La Hán', description: 'Cây Tùng La Hán thân gỗ nhỏ, dáng đẹp. Thường trồng trong chậu trang trí, mang ý nghĩa trường thọ.', price: 950000, stock: 20, categoryId: categories[1]._id, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
      { name: 'Phân Bón NPK', description: 'Phân bón NPK cân đối dinh dưỡng cho cây trồng. Sử dụng cho cây cảnh, rau, hoa. Gói 1kg.', price: 85000, stock: 200, categoryId: categories[4]._id, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
      { name: 'Đất Trồng Cây', description: 'Đất trồng cây chất lượng cao, giàu dinh dưỡng. Thích hợp cho cây cảnh, rau, hoa. Bao 5kg.', price: 65000, stock: 150, categoryId: categories[4]._id, imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400' },
      { name: 'Cây Thiết Mộc Lan', description: 'Cây Thiết Mộc Lan hay cây Đuôi Công, lá dài xanh bóng. Trồng trong nhà lọc không khí tốt.', price: 320000, stock: 45, categoryId: categories[0]._id, imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' },
      { name: 'Cây Sanh', description: 'Cây Sanh bon sai phổ biến, thân gỗ đẹp, dáng cây tự nhiên. Trồng ngoài trời, cần tưới đều.', price: 2200000, stock: 10, categoryId: categories[1]._id, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
      { name: 'Cây Hương Thảo', description: 'Cây Hương Thảo thơm ngát, có thể trồng trong nhà hoặc ban công. Vừa làm cảnh vừa lấy lá gia vị.', price: 95000, stock: 70, categoryId: categories[0]._id, imageUrl: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400' },
      { name: 'Cây Sen Đá', description: 'Cây Sen Đá nhiều loại, lá mọng nước xếp đẹp. Dễ chăm sóc, phù hợp trang trí bàn, kệ.', price: 45000, stock: 120, categoryId: categories[0]._id, imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' }
    ]);
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