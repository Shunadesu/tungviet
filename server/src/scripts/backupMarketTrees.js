import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Import models
import '../models/MarketTree.js';

console.log('Connecting to MongoDB...');
await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

const MarketTree = mongoose.model('MarketTree');

async function backupMarketTrees() {
  console.log('\n=== Backing up MarketTree collection ===\n');

  try {
    const trees = await MarketTree.find({}).lean();
    
    console.log(`Found ${trees.length} MarketTree document(s)`);

    const backupDir = path.resolve(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `market-trees-backup-${timestamp}.json`);

    fs.writeFileSync(backupPath, JSON.stringify(trees, null, 2), 'utf8');

    console.log(`\n✓ Backup saved to: ${backupPath}`);
    console.log(`File size: ${(fs.statSync(backupPath).size / 1024).toFixed(2)} KB\n`);

  } catch (error) {
    console.error('\n✗ Backup failed:', error);
    throw error;
  }
}

try {
  await backupMarketTrees();
  console.log('Closing database connection...');
  await mongoose.connection.close();
  console.log('Done!');
  process.exit(0);
} catch (error) {
  console.error('Fatal error:', error);
  await mongoose.connection.close();
  process.exit(1);
}