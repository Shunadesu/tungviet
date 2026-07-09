import * as XLSX from 'xlsx';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLUMN_MAPPING = {
  'STT': 'stt',
  'Nội dung': 'feature',
  'Phạm vi công việc': 'description',
  'Độ phức tạp': 'complexity',
  'Thời gian ước tính': 'estimatedHours',
  'Ngày': 'estimatedDays',
  'Đơn giá': 'hourlyRate',
  'Thành tiền': 'totalCost',
  'Ghi chú': 'notes',
  'Sản phẩm': 'product',
};

const estimateSchema = new mongoose.Schema({
  stt: { type: Number, default: 0 },
  feature: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  complexity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  estimatedHours: { type: Number, required: true, min: 0, default: 0 },
  hourlyRate: { type: Number, required: true, min: 0, default: 0 },
  totalCost: { type: Number, required: true, min: 0, default: 0 },
  estimatedDays: { type: Number, required: true, min: 0, default: 0 },
  notes: { type: String, default: '' },
  product: { type: String, default: '' },
}, { timestamps: true });

const Estimate = mongoose.model('Estimate', estimateSchema);

function parseValue(key, value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numKeys = ['stt', 'estimatedHours', 'estimatedDays', 'hourlyRate', 'totalCost'];
  if (numKeys.includes(key)) {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }

  return String(value).trim();
}

function transformRow(row, headers) {
  const transformed = {};

  headers.forEach((header, index) => {
    const fieldName = COLUMN_MAPPING[header];
    if (fieldName && row[index] !== undefined) {
      transformed[fieldName] = parseValue(fieldName, row[index]);
    }
  });

  return {
    stt: transformed.stt ?? 0,
    feature: transformed.feature || '',
    description: transformed.description || '',
    complexity: ['Low', 'Medium', 'High'].includes(transformed.complexity)
      ? transformed.complexity : 'Medium',
    estimatedHours: transformed.estimatedHours ?? 0,
    estimatedDays: transformed.estimatedDays ?? 0,
    hourlyRate: transformed.hourlyRate ?? 0,
    totalCost: transformed.totalCost ?? 0,
    notes: transformed.notes || '',
    product: transformed.product || '',
  };
}

async function importEstimate(filePath) {
  try {
    console.log(`Reading file: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length < 2) {
      console.log('No data found in file');
      return;
    }

    const headers = data[0].map(h => String(h).trim());
    const rows = data.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== null && cell !== ''));

    console.log(`Found ${rows.length} rows to import`);

    const estimates = rows.map(row => transformRow(row, headers));

    const validEstimates = estimates.filter(e => e.feature && e.feature.trim() !== '');

    if (validEstimates.length === 0) {
      console.log('No valid estimates found (missing feature names)');
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Estimate.deleteMany({});
    console.log('Cleared existing estimates');

    const saved = await Estimate.insertMany(validEstimates);
    console.log(`Successfully imported ${saved.length} estimates`);

    const summary = {
      totalItems: saved.length,
      totalHours: saved.reduce((sum, e) => sum + (e.estimatedHours || 0), 0),
      totalDays: saved.reduce((sum, e) => sum + (e.estimatedDays || 0), 0),
      totalCost: saved.reduce((sum, e) => sum + (e.totalCost || 0), 0),
    };

    console.log('\n--- Summary ---');
    console.log(`Total Items: ${summary.totalItems}`);
    console.log(`Total Hours: ${summary.totalHours}`);
    console.log(`Total Days: ${summary.totalDays}`);
    console.log(`Total Cost: ${summary.totalCost.toLocaleString('vi-VN')} VND`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error importing estimates:', error.message);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node importEstimate.js <path-to-excel-file>');
  console.log('Example: node importEstimate.js ./data/bao-gia.xlsx');
  process.exit(1);
}

importEstimate(args[0]);
