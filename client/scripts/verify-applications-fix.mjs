import { getApplicationLabels, getApplicationLabel } from '../src/utils/productApplications.js';

// Shape thực tế từ API /api/public/products/:id
const apiApplications = [
  { title: 'Cải thiện độ cứng', titleEn: '', description: '', descriptionEn: '', imageUrl: '', order: 0, isActive: true, _id: 'a' },
  { title: 'Dẻ bám dính mạnh', titleEn: '', description: '', descriptionEn: '', imageUrl: '', order: 1, isActive: true, _id: 'b' },
  { title: 'Dẻ bám tốt', titleEn: '', description: '', descriptionEn: '', imageUrl: '', order: 2, isActive: true, _id: 'c' },
  { title: 'Chống ngải vàng', titleEn: '', description: '', descriptionEn: '', imageUrl: '', order: 3, isActive: true, _id: 'd' },
];

const legacy = ['Ứng dụng cũ 1', 'Ứng dụng cũ 2'];
const withHidden = [...apiApplications, { title: 'Ẩn', titleEn: '', isActive: false, order: 4, _id: 'e' }];
const withEnglish = [{ title: 'Vie', titleEn: 'English name', order: 0, isActive: true }];

console.log('VI object  ->', getApplicationLabels(apiApplications, 'vi'));
console.log('EN object  ->', getApplicationLabels(apiApplications, 'en'));
console.log('legacy     ->', getApplicationLabels(legacy, 'vi'));
console.log('hidden     ->', getApplicationLabels(withHidden, 'vi'));
console.log('en fallback->', getApplicationLabels(withEnglish, 'en'));
console.log('empty      ->', getApplicationLabels([], 'vi'));
console.log('null       ->', getApplicationLabels(null, 'vi'));
console.log('label(obj) ->', getApplicationLabel(apiApplications[0], 'vi'));
console.log('label(str) ->', getApplicationLabel('plain', 'vi'));
