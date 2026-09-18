import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import models
import '../models/MarketTree.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

console.log('Connecting to MongoDB...');
await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

const MarketTree = mongoose.model('MarketTree');

async function migrateMarketTreeStructure() {
  console.log('\n=== Starting MarketTree Structure Migration ===\n');

  try {
    // Find all MarketTrees with applications at root level
    const trees = await MarketTree.find({ applications: { $exists: true, $ne: [] } });
    
    console.log(`Found ${trees.length} MarketTree(s) with applications at root level\n`);

    if (trees.length === 0) {
      console.log('No migration needed. All MarketTrees are already in the new structure.');
      return;
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const tree of trees) {
      console.log(`\nProcessing: ${tree.title} (ID: ${tree._id})`);
      console.log(`  - Applications at root: ${tree.applications?.length || 0}`);
      console.log(`  - Technologies: ${tree.technologies?.length || 0}`);

      // Skip if no technologies exist
      if (!tree.technologies || tree.technologies.length === 0) {
        console.log('  ⚠️  Skipped: No technologies found. Please add technologies first.');
        skipCount++;
        continue;
      }

      // Backup original applications
      const originalApplications = tree.applications || [];
      
      // Move all applications to the first technology
      const firstTech = tree.technologies[0];
      console.log(`  → Moving ${originalApplications.length} applications to technology: "${firstTech.title}"`);
      
      // Assign applications to first technology
      tree.technologies[0].applications = originalApplications;
      
      // Clear root-level applications
      tree.applications = [];
      
      // Save the changes
      await tree.save();
      
      console.log('  ✓ Migration successful');
      successCount++;
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total processed: ${trees.length}`);
    console.log(`✓ Successful: ${successCount}`);
    console.log(`⚠️  Skipped: ${skipCount}`);
    console.log(`✗ Errors: ${errorCount}`);
    
    console.log('\n✓ Migration completed successfully!\n');

  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    throw error;
  }
}

// Run migration
try {
  await migrateMarketTreeStructure();
  console.log('Closing database connection...');
  await mongoose.connection.close();
  console.log('Done!');
  process.exit(0);
} catch (error) {
  console.error('Fatal error:', error);
  await mongoose.connection.close();
  process.exit(1);
}
