import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import ProductColumn from '../src/models/ProductColumn.js';
import { productColumnService } from '../src/services/productColumn.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI chưa được cấu hình trong .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  const before = await ProductColumn.countDocuments({});
  const result = await productColumnService.seedDefaults();
  const after = await ProductColumn.countDocuments({});

  console.log(JSON.stringify({
    existed: before,
    after,
    skipped: result.skipped,
    inserted: after - before,
  }, null, 2));

  const list = await ProductColumn.find({}).sort({ order: 1 }).lean();
  for (const col of list) {
    console.log(`- [${col.order}] ${col.key} | ${col.name} | ${col.nameEn} | active=${col.isActive}`);
  }

  await mongoose.disconnect();
  console.log('=== DONE ===');
}

main().catch((err) => {
  console.error('ERROR:', err);
  process.exit(1);
});