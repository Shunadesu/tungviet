// Update EN content for existing categories and products via admin API
const CATEGORY_EN = [
  { vi: 'Cây Cảnh Trong Nhà', nameEn: 'Indoor Ornamental Plants', descriptionEn: 'Various ornamental plants suitable for growing indoors' },
  { vi: 'Cây Cảnh Ngoài Trời', nameEn: 'Outdoor Ornamental Plants', descriptionEn: 'Ornamental plants for garden and yard' },
  { vi: 'Cây Ăn Quả', nameEn: 'Fruit Trees', descriptionEn: 'Trees that produce edible fruits' },
  { vi: 'Cây Hoa', nameEn: 'Flowering Plants', descriptionEn: 'All kinds of flowering plants' },
  { vi: 'Phân Bón & Chăm Sóc', nameEn: 'Fertilizers & Plant Care', descriptionEn: 'Fertilizers, pesticides, and plant care tools' },
];

const PRODUCT_EN = [
  { vi: 'Cây Kim Ngân', nameEn: 'Money Tree (Pachira)', descriptionEn: 'The Money Tree is a popular feng shui plant that brings wealth and good fortune. Easy to care for, perfect for indoor spaces.' },
  { vi: 'Cây Đại Tiện', nameEn: 'Aglaonema', descriptionEn: 'Aglaonema features large round green leaves, purifying the air and adding freshness to your living space.' },
  { vi: 'Cây Trầu Bà', nameEn: 'Golden Pothos', descriptionEn: 'Golden Pothos is a climbing plant that is easy to grow and has excellent air-purifying abilities. Great for balconies and skylights.' },
  { vi: 'Cây Lưỡi Hổ', nameEn: 'Snake Plant', descriptionEn: 'Snake Plant has sturdy upright leaves and is very low-maintenance. It purifies air and absorbs formaldehyde.' },
  { vi: 'Cây Bàng Singapore', nameEn: 'Fiddle Leaf Fig', descriptionEn: 'Fiddle Leaf Fig has lush green foliage and a beautiful upright trunk. Ideal for indoor spaces with moderate light.' },
  { vi: 'Cây Cau Cảnh', nameEn: 'Areca Palm', descriptionEn: 'Areca Palm brings a tropical vibe, perfect for living rooms and offices. Low-maintenance and boosts oxygen levels.' },
  { vi: 'Cây Phong Lan', nameEn: 'Orchid', descriptionEn: 'Orchids with vibrant beautiful blooms, ideal for decorating balconies and gardens. Available in many colors.' },
  { vi: 'Cây Hồng Môn', nameEn: 'Anthurium', descriptionEn: 'Anthurium with red or pink heart-shaped flowers symbolizes love and happiness. Great indoor air purifier.' },
  { vi: 'Cây Cẩm Cù', nameEn: 'Hoya', descriptionEn: 'Hoya has thick glossy green leaves and tiny beautiful flowers. The plant absorbs electronic radiation well.' },
  { vi: 'Cây Xương Rồng', nameEn: 'Cactus', descriptionEn: 'Various cactus species, easy to care for, low water needs. Perfect for desks and windowsills.' },
  { vi: 'Cây Nho', nameEn: 'Grape Vine', descriptionEn: 'Grape vine produces sweet fruits and can be grown in gardens or large pots. Provides shade and harvest.' },
  { vi: 'Cây Bưởi', nameEn: 'Pomelo Tree', descriptionEn: 'Pomelo tree produces large juicy fruits. Planted in gardens for shade and clean home-grown fruit.' },
  { vi: 'Cây Mai Vàng', nameEn: 'Apricot Blossom', descriptionEn: 'Apricot Blossom is the iconic Tet holiday flower with radiant yellow blooms. Grown outdoors with plenty of sunlight.' },
  { vi: 'Cây Tùng La Hán', nameEn: 'Buddhist Pine', descriptionEn: 'Buddhist Pine is a small woody plant with a beautiful shape. Often potted for decoration, symbolizing longevity.' },
  { vi: 'Phân Bón NPK', nameEn: 'NPK Fertilizer', descriptionEn: 'Balanced NPK fertilizer for all plants. Suitable for ornamentals, vegetables, and flowers. 1kg package.' },
  { vi: 'Đất Trồng Cây', nameEn: 'Potting Soil', descriptionEn: 'High-quality nutrient-rich potting soil. Ideal for ornamentals, vegetables, and flowers. 5kg bag.' },
  { vi: 'Cây Thiết Mộc Lan', nameEn: 'Dracaena', descriptionEn: 'Dracaena has long glossy green leaves. Excellent indoor air purifier.' },
  { vi: 'Cây Sanh', nameEn: 'Ficus Bonsai', descriptionEn: 'Ficus Bonsai is a popular bonsai with beautiful wood trunk and natural shape. Grown outdoors with regular watering.' },
  { vi: 'Cây Hương Thảo', nameEn: 'Rosemary', descriptionEn: 'Rosemary has a lovely fragrance and can be grown indoors or on balconies. Decorative and useful as a culinary herb.' },
  { vi: 'Cây Sen Đá', nameEn: 'Succulent', descriptionEn: 'Various succulent species with beautifully arranged fleshy leaves. Easy to care for, perfect for desks and shelves.' },
];

const BASE = 'http://localhost:9007';

async function login() {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@zuna.vn', password: 'admin123' }),
  });
  const data = await res.json();
  return data.data.token;
}

async function fetchList(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data;
}

async function updateItem(path, token, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${path} -> ${res.status}: ${text}`);
  }
  return res.json();
}

(async () => {
  try {
    const token = await login();
    console.log('Logged in');

    // Categories
    const cats = await fetchList('/api/admin/categories?limit=100', token);
    const catMap = Object.fromEntries(CATEGORY_EN.map((c) => [c.vi, c]));
    let catUpdated = 0;
    for (const c of cats) {
      const en = catMap[c.name];
      if (!en) continue;
      await updateItem(`/api/admin/categories/${c._id}`, token, {
        name: c.name,
        nameEn: en.nameEn,
        description: c.description,
        descriptionEn: en.descriptionEn,
        imageUrl: c.imageUrl,
        isActive: c.isActive,
      });
      catUpdated++;
      console.log(`Cat: ${c.name} -> ${en.nameEn}`);
    }
    console.log(`Categories updated: ${catUpdated}/${cats.length}`);

    // Products
    const prods = await fetchList('/api/admin/products?limit=100', token);
    const prodMap = Object.fromEntries(PRODUCT_EN.map((p) => [p.vi, p]));
    let prodUpdated = 0;
    for (const p of prods) {
      const en = prodMap[p.name];
      if (!en) continue;
      const catId = p.categoryId._id || p.categoryId;
      await updateItem(`/api/admin/products/${p._id}`, token, {
        name: p.name,
        nameEn: en.nameEn,
        description: p.description,
        descriptionEn: en.descriptionEn,
        price: p.price,
        stock: p.stock,
        categoryId: catId,
        imageUrl: p.imageUrl,
        isActive: p.isActive,
      });
      prodUpdated++;
      console.log(`Prod: ${p.name} -> ${en.nameEn}`);
    }
    console.log(`Products updated: ${prodUpdated}/${prods.length}`);

    console.log('=== DONE ===');
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
})();