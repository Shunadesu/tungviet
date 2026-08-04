import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/db.js';
import { logger, requestLogger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { trackVisitor } from './middlewares/trackVisitor.js';
import { apiResponse } from './utils/apiResponse.js';
import { swaggerSpec } from './config/swagger.js';
import { productColumnService } from './services/productColumn.service.js';

import publicRoutes from './routes/public/product.routes.js';
import publicCategoryRoutes from './routes/public/category.routes.js';
import publicSiteConfigRoutes from './routes/public/siteConfig.routes.js';
import publicMarketRoutes from './routes/public/market.routes.js';
import publicMemberRoutes from './routes/public/member.routes.js';
import publicLocationRoutes from './routes/public/location.routes.js';
import publicLeadershipRoutes from './routes/public/leadership.routes.js';
import publicProductColumnRoutes from './routes/public/productColumn.routes.js';
import clientOrderRoutes from './routes/client/order.routes.js';
import adminProductRoutes from './routes/admin/product.routes.js';
import adminCategoryRoutes from './routes/admin/category.routes.js';
import adminOrderRoutes from './routes/admin/order.routes.js';
import adminUploadRoutes from './routes/admin/upload.routes.js';
import adminProductColumnRoutes from './routes/admin/productColumn.routes.js';
import adminSiteConfigRoutes from './routes/admin/siteConfig.routes.js';
import adminMarketRoutes from './routes/admin/market.routes.js';
import adminMemberRoutes from './routes/admin/member.routes.js';
import adminLocationRoutes from './routes/admin/location.routes.js';
import adminLeadershipRoutes from './routes/admin/leadership.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminQuoteSectionRoutes from './routes/admin/quoteSection.routes.js';
import publicQuoteSectionRoutes from './routes/public/quoteSection.routes.js';
import clientQuoteSectionRoutes from './routes/client/quoteSection.routes.js';
import adminPartnerRoutes from './routes/admin/partner.routes.js';
import publicPartnerRoutes from './routes/public/partner.routes.js';
import adminPostRoutes from './routes/admin/post.routes.js';
import publicPostRoutes from './routes/public/post.routes.js';
import estimateRoutes from './routes/estimate.routes.js';
import analyticsRoutes from './routes/admin/analytics.routes.js';

import Product from './models/Product.js';
import Category from './models/Category.js';
import Order from './models/Order.js';
import OrderDetail from './models/OrderDetail.js';
import Estimate from './models/Estimate.js';
import User from './models/User.js';
import QuoteSection from './models/QuoteSection.js';
import QuoteSubmission from './models/QuoteSubmission.js';
import SiteConfig from './models/SiteConfig.js';
import Partner from './models/Partner.js';
import Post from './models/Post.js';
import Market from './models/Market.js';
import Member from './models/Member.js';
import Location from './models/Location.js';
import Leadership from './models/Leadership.js';
import ProductColumn from './models/ProductColumn.js';
import VisitLog from './models/VisitLog.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

connectDB()
  .then(async () => {
    try {
      await Promise.all([
        Product.syncIndexes(),
        Category.syncIndexes(),
        Order.syncIndexes(),
        OrderDetail.syncIndexes(),
        Estimate.syncIndexes(),
        User.syncIndexes(),
        SiteConfig.syncIndexes(),
        Market.syncIndexes(),
        Member.syncIndexes(),
        Location.syncIndexes(),
        Leadership.syncIndexes(),
        QuoteSection.syncIndexes(),
        QuoteSubmission.syncIndexes(),
        Partner.syncIndexes(),
        Post.syncIndexes(),
        ProductColumn.syncIndexes(),
        VisitLog.syncIndexes(),
      ]);
      logger.info('MongoDB indexes synced');

      const seed = await productColumnService.seedDefaults();
      logger.info(
        { skipped: seed.skipped, total: seed.total },
        'ProductColumn seed done'
      );
    } catch (err) {
      logger.warn({ err: err.message }, 'Index sync / seed failed (continuing)');
    }
  })
  .catch((err) => {
    logger.error({ err: err.message }, 'DB connection failed');
    process.exit(1);
  });

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(requestLogger);
app.use(trackVisitor);
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/api/public/products', publicRoutes);
app.use('/api/public/categories', publicCategoryRoutes);
app.use('/api/public/site-config', publicSiteConfigRoutes);
app.use('/api/public/markets', publicMarketRoutes);
app.use('/api/public/members', publicMemberRoutes);
app.use('/api/public/locations', publicLocationRoutes);
app.use('/api/public/leadership', publicLeadershipRoutes);
app.use('/api/public/product-columns', publicProductColumnRoutes);
app.use('/api/public/quote-section', publicQuoteSectionRoutes);
app.use('/api/public/partners', publicPartnerRoutes);
app.use('/api/public/posts', publicPostRoutes);
app.use('/api/client/orders', clientOrderRoutes);
app.use('/api/client/quote-section', clientQuoteSectionRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/upload', adminUploadRoutes);
app.use('/api/admin/product-columns', adminProductColumnRoutes);
app.use('/api/admin/site-config', adminSiteConfigRoutes);
app.use('/api/admin/markets', adminMarketRoutes);
app.use('/api/admin/members', adminMemberRoutes);
app.use('/api/admin/locations', adminLocationRoutes);
app.use('/api/admin/leadership', adminLeadershipRoutes);
app.use('/api/admin/quote-section', adminQuoteSectionRoutes);
app.use('/api/admin/partners', adminPartnerRoutes);
app.use('/api/admin/posts', adminPostRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/estimates', estimateRoutes);

app.get('/api/health', (req, res) => {
  return apiResponse.ok(res, { status: 'OK', message: 'Server is running' });
});

app.get('/api/openapi.json', (req, res) => res.json(swaggerSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} (env=${process.env.NODE_ENV || 'development'})`);
});

export default app;
