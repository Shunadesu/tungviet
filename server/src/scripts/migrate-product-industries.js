/**
 * Migration: convert Product.mainTree (single ObjectId) → Product.industries (Array<ObjectId>).
 *
 * Usage:
 *   node src/scripts/migrate-product-industries.js           # run migration
 *   node src/scripts/migrate-product-industries.js --dry-run # show what would happen
 *
 * Safe to re-run: idempotent. Products that already have `industries` set will be left
 * untouched; only docs still carrying the legacy `mainTree` field are migrated.
 *
 * Requires: MONGODB_URI env var, mongoose connection helper from src/config/db.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const DRY_RUN = process.argv.includes('--dry-run');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[migrate-product-industries] MONGODB_URI is not set');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('[migrate-product-industries] connected');

  // Find products that still carry the legacy single-ObjectId `mainTree` field
  // AND have not yet been migrated to `industries`.
  const cursor = Product.find({
    mainTree: { $exists: true, $ne: null },
    $or: [
      { industries: { $exists: false } },
      { industries: { $size: 0 } },
    ],
  }).cursor();

  let total = 0;
  let migrated = 0;
  let skipped = 0;

  for await (const doc of cursor) {
    total += 1;
    const mainTreeId = doc.mainTree;
    if (!mainTreeId) {
      skipped += 1;
      continue;
    }

    if (DRY_RUN) {
      console.log(`[dry-run] would migrate product ${doc._id} (${doc.productCode || doc.name}) → industries=[${mainTreeId}]`);
      migrated += 1;
      continue;
    }

    doc.industries = [mainTreeId];
    doc.mainTree = undefined;
    // mongoose-delete plugin uses `deleted` flag — keep document alive
    await doc.save();
    migrated += 1;
  }

  console.log(
    `[migrate-product-industries] done. scanned=${total} migrated=${migrated} skipped=${skipped} dryRun=${DRY_RUN}`
  );

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('[migrate-product-industries] failed:', err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});