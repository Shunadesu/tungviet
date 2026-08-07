import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { logger } from '../utils/logger.js';

/**
 * One-time migration to ensure backward-compatibility with old data.
 * - Old Products have no webStatus → set to 'published' if isActive, else 'archived'
 * - Old Categories have no mainTree → leave as null
 */
export const migrationService = {
  async runHierarchyMigration() {
    try {
      // Migrate Products: set webStatus based on isActive
      const productsToMigrate = await Product.find({
        $or: [{ webStatus: { $exists: false } }, { webStatus: null }],
      }).select('_id isActive').lean();

      if (productsToMigrate.length > 0) {
        const ops = productsToMigrate.map((p) => ({
          updateOne: {
            filter: { _id: p._id },
            update: {
              $set: {
                webStatus: p.isActive === false ? 'archived' : 'published',
              },
            },
          },
        }));
        await Product.bulkWrite(ops);
        logger.info(
          { migrated: productsToMigrate.length },
          'Migrated Product.webStatus (one-time)'
        );
      }

      // Ensure Categories have a slug (back-compat). If missing, generate from name.
      const catsWithoutSlug = await Category.find({
        $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }],
      }).select('_id name').lean();

      if (catsWithoutSlug.length > 0) {
        const slugify = (s) =>
          (s || '')
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
        const ops = catsWithoutSlug.map((c) => ({
          updateOne: {
            filter: { _id: c._id },
            update: { $set: { slug: slugify(c.name) } },
          },
        }));
        await Category.bulkWrite(ops);
        logger.info(
          { migrated: catsWithoutSlug.length },
          'Migrated Category.slug (one-time)'
        );
      }
    } catch (err) {
      logger.warn({ err: err.message }, 'Hierarchy migration skipped');
    }
  },
};

export default migrationService;