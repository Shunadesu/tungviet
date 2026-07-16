import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

const CATEGORY_EN = {
  'Cây Cảnh Trong Nhà': {
    nameEn: 'Indoor Ornamental Plants',
    descriptionEn: 'Various ornamental plants suitable for growing indoors',
  },
  'Cây Cảnh Ngoài Trời': {
    nameEn: 'Outdoor Ornamental Plants',
    descriptionEn: 'Ornamental plants for garden and yard',
  },
  'Cây Ăn Quả': {
    nameEn: 'Fruit Trees',
    descriptionEn: 'Trees that produce edible fruits',
  },
  'Cây Hoa': {
    nameEn: 'Flowering Plants',
    descriptionEn: 'All kinds of flowering plants',
  },
  'Phân Bón & Chăm Sóc': {
    nameEn: 'Fertilizers & Plant Care',
    descriptionEn: 'Fertilizers, pesticides, and plant care tools',
  },
};

const PRODUCT_EN = {
  'Cây Kim Ngân': {
    nameEn: 'Money Tree (Pachira)',
    descriptionEn:
      'The Money Tree is a popular feng shui plant that brings wealth and good fortune. Easy to care for, perfect for indoor spaces.',
  },
  'Cây Đại Tiện': {
    nameEn: 'Aglaonema',
    descriptionEn:
      'Aglaonema features large round green leaves, purifying the air and adding freshness to your living space.',
  },
  'Cây Trầu Bà': {
    nameEn: 'Golden Pothos',
    descriptionEn:
      'Golden Pothos is a climbing plant that is easy to grow and has excellent air-purifying abilities. Great for balconies and skylights.',
  },
  'Cây Lưỡi Hổ': {
    nameEn: 'Snake Plant',
    descriptionEn:
      'Snake Plant has sturdy upright leaves and is very low-maintenance. It purifies air and absorbs formaldehyde.',
  },
  'Cây Bàng Singapore': {
    nameEn: 'Fiddle Leaf Fig',
    descriptionEn:
      'Fiddle Leaf Fig has lush green foliage and a beautiful upright trunk. Ideal for indoor spaces with moderate light.',
  },
  'Cây Cau Cảnh': {
    nameEn: 'Areca Palm',
    descriptionEn:
      'Areca Palm brings a tropical vibe, perfect for living rooms and offices. Low-maintenance and boosts oxygen levels.',
  },
  'Cây Phong Lan': {
    nameEn: 'Orchid',
    descriptionEn:
      'Orchids with vibrant beautiful blooms, ideal for decorating balconies and gardens. Available in many colors.',
  },
  'Cây Hồng Môn': {
    nameEn: 'Anthurium',
    descriptionEn:
      'Anthurium with red or pink heart-shaped flowers symbolizes love and happiness. Great indoor air purifier.',
  },
  'Cây Cẩm Cù': {
    nameEn: 'Hoya',
    descriptionEn:
      'Hoya has thick glossy green leaves and tiny beautiful flowers. The plant absorbs electronic radiation well.',
  },
  'Cây Xương Rồng': {
    nameEn: 'Cactus',
    descriptionEn:
      'Various cactus species, easy to care for, low water needs. Perfect for desks and windowsills.',
  },
  'Cây Nho': {
    nameEn: 'Grape Vine',
    descriptionEn:
      'Grape vine produces sweet fruits and can be grown in gardens or large pots. Provides shade and harvest.',
  },
  'Cây Bưởi': {
    nameEn: 'Pomelo Tree',
    descriptionEn:
      'Pomelo tree produces large juicy fruits. Planted in gardens for shade and clean home-grown fruit.',
  },
  'Cây Mai Vàng': {
    nameEn: 'Apricot Blossom',
    descriptionEn:
      'Apricot Blossom is the iconic Tet holiday flower with radiant yellow blooms. Grown outdoors with plenty of sunlight.',
  },
  'Cây Tùng La Hán': {
    nameEn: 'Buddhist Pine',
    descriptionEn:
      'Buddhist Pine is a small woody plant with a beautiful shape. Often potted for decoration, symbolizing longevity.',
  },
  'Phân Bón NPK': {
    nameEn: 'NPK Fertilizer',
    descriptionEn:
      'Balanced NPK fertilizer for all plants. Suitable for ornamentals, vegetables, and flowers. 1kg package.',
  },
  'Đất Trồng Cây': {
    nameEn: 'Potting Soil',
    descriptionEn:
      'High-quality nutrient-rich potting soil. Ideal for ornamentals, vegetables, and flowers. 5kg bag.',
  },
  'Cây Thiết Mộc Lan': {
    nameEn: 'Dracaena',
    descriptionEn:
      'Dracaena has long glossy green leaves. Excellent indoor air purifier.',
  },
  'Cây Sanh': {
    nameEn: 'Ficus Bonsai',
    descriptionEn:
      'Ficus Bonsai is a popular bonsai with beautiful wood trunk and natural shape. Grown outdoors with regular watering.',
  },
  'Cây Hương Thảo': {
    nameEn: 'Rosemary',
    descriptionEn:
      'Rosemary has a lovely fragrance and can be grown indoors or on balconies. Decorative and useful as a culinary herb.',
  },
  'Cây Sen Đá': {
    nameEn: 'Succulent',
    descriptionEn:
      'Various succulent species with beautifully arranged fleshy leaves. Easy to care for, perfect for desks and shelves.',
  },
};

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const categories = await Category.find({});
    let catUpdated = 0;
    for (const cat of categories) {
      const en = CATEGORY_EN[cat.name];
      if (!en) continue;
      if (cat.nameEn !== en.nameEn || cat.descriptionEn !== en.descriptionEn) {
        cat.nameEn = en.nameEn;
        cat.descriptionEn = en.descriptionEn;
        await cat.save();
        catUpdated += 1;
      }
    }
    console.log(`Updated categories: ${catUpdated}/${categories.length}`);

    const products = await Product.find({});
    let prodUpdated = 0;
    for (const prod of products) {
      const en = PRODUCT_EN[prod.name];
      if (!en) continue;
      if (prod.nameEn !== en.nameEn || prod.descriptionEn !== en.descriptionEn) {
        prod.nameEn = en.nameEn;
        prod.descriptionEn = en.descriptionEn;
        await prod.save();
        prodUpdated += 1;
      }
    }
    console.log(`Updated products: ${prodUpdated}/${products.length}`);

    console.log('\n=== EN seed complete ===\n');
    process.exit();
  } catch (err) {
    console.error('Seed EN error:', err);
    process.exit(1);
  }
};

run();