import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/db.js';
import { logger, requestLogger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { trackVisitor } from './middlewares/trackVisitor.js';
import securityHeaders from './middlewares/securityHeaders.js';
import { apiResponse } from './utils/apiResponse.js';
import { swaggerSpec } from './config/swagger.js';
import { productColumnService } from './services/productColumn.service.js';
import { startAnalyticsJobs, stopAnalyticsJobs } from './jobs/analyticsCleanup.js';

import publicRoutes from './routes/public/product.routes.js';
import publicCategoryRoutes from './routes/public/category.routes.js';
import publicSiteConfigRoutes from './routes/public/siteConfig.routes.js';
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
import publicPostCategoryRoutes from './routes/public/postCategory.routes.js';
import adminPostCategoryRoutes from './routes/admin/postCategory.routes.js';
import estimateRoutes from './routes/estimate.routes.js';
import projectReportRoutes from './routes/projectReport.routes.js';
import analyticsRoutes from './routes/admin/analytics.routes.js';
import adminDashboardRoutes from './routes/admin/dashboard.routes.js';
import publicMainTreeRoutes from './routes/public/mainTree.routes.js';
import adminMainTreeRoutes from './routes/admin/mainTree.routes.js';
import publicMarketTreeRoutes from './routes/public/marketTree.routes.js';
import adminMarketTreeRoutes from './routes/admin/marketTree.routes.js';
import publicHomeRoutes from './routes/public/home.routes.js';
import publicSeoRoutes from './routes/public/seo.routes.js';
import publicMarketRoutes from './routes/public/market.routes.js';

import Product from './models/Product.js';
import Category from './models/Category.js';
import Order from './models/Order.js';
import OrderDetail from './models/OrderDetail.js';
import Estimate from './models/Estimate.js';
import ProjectReport from './models/ProjectReport.js';
import User from './models/User.js';
import QuoteSection from './models/QuoteSection.js';
import QuoteSubmission from './models/QuoteSubmission.js';
import SiteConfig from './models/SiteConfig.js';
import Partner from './models/Partner.js';
import Post from './models/Post.js';
import PostCategory from './models/PostCategory.js';
import Member from './models/Member.js';
import Location from './models/Location.js';
import Leadership from './models/Leadership.js';
import ProductColumn from './models/ProductColumn.js';
import VisitLog from './models/VisitLog.js';
import MainTree from './models/MainTree.js';
import MarketTree from './models/MarketTree.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Whitelist CORS.
 *
 * Trước đây API trả `Access-Control-Allow-Origin` cho mọi origin và còn
 * chấp nhận mọi domain `*.vercel.app` ⇒ bất kỳ app Vercel nào cũng gọi được
 * API kèm cookie/credentials. Nay chỉ origin nằm trong whitelist mới được phép.
 */
const PRODUCTION_ALLOWED_ORIGINS = [
  'https://tungvietclient.vercel.app',
  'https://tungviet.com',
  'https://tungviet.fun',
  'https://www.tungviet.fun',
];

const DEV_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
];

const parseList = (value) =>
  String(value || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([
    ...parseList(process.env.CLIENT_URL),
    ...parseList(process.env.ADMIN_URL),
    ...parseList(process.env.EXTRA_ORIGINS),
    ...(isProduction ? PRODUCTION_ALLOWED_ORIGINS : [...PRODUCTION_ALLOWED_ORIGINS, ...DEV_ALLOWED_ORIGINS]),
  ])
);

if (isProduction && parseList(process.env.CLIENT_URL).length === 0) {
  logger.warn(
    'CLIENT_URL chưa được đặt — đang dùng domain mặc định. Hãy đặt CLIENT_URL/ADMIN_URL/EXTRA_ORIGINS trong .env.'
  );
}

const corsOptions = {
  origin(origin, callback) {
    // Không có Origin header (curl, server-to-server, mobile app) → cho phép.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }
    // Trả `false` thay vì `new Error(...)` — nếu throw, errorHandler sẽ log
    // "Unhandled error" mỗi lần bị chặn và trả 500, gây ồn log trên VPS.
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  maxAge: 86400,
};

const app = express();
app.set('trust proxy', 1);

// Security headers — applied first.
// helmet chạy TRƯỚC securityHeaders để middleware custom ghi đè được các
// header mà helmet đặt mặc định theo hướng "an toàn hơn nhưng không đúng ý":
//   - helmet đặt X-Frame-Options: SAMEORIGIN  → securityHeaders đặt DENY (chặn iframe hoàn toàn)
//   - helmet đặt X-XSS-Protection: 0          → securityHeaders đặt 1; mode=block
//   - helmet đặt Referrer-Policy: no-referrer  → securityHeaders đặt strict-origin-when-cross-origin
// Nếu đảo thứ tự, các header cứng nhặt của helmet sẽ đè lên chính sách đã cấu hình.
// HSTS do securityHeaders tự quản lý (chỉ bật ở production, max-age=1y) → tắt trong helmet.
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Cho phép cross-origin ảnh từ /uploads
    contentSecurityPolicy: false, // CSP đã được set trong securityHeaders
    hsts: false, // HSTS do securityHeaders quản lý
  })
);
app.use(securityHeaders);
app.use(compression());
app.use(cors(corsOptions));

// Rate limit chung — chặn bot quét dẫn tới tải CPU/DB.
// Lưu ý: khi mount bằng app.use('/api', ...), Express cắt mount path khỏi
// req.path (thành '/health'), nên phải dùng originalUrl để so sánh.
const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const p = (req.originalUrl || req.url).split('?')[0];
    return p === '/api/health' || p === '/health';
  },
  message: { success: false, message: 'Bạn gửi quá nhiều request, vui lòng thử lại sau ít phút.' },
});

connectDB()
  .then(async () => {
    try {
      await Promise.all([
        Product.syncIndexes(),
        Category.syncIndexes(),
        Order.syncIndexes(),
        OrderDetail.syncIndexes(),
        Estimate.syncIndexes(),
        ProjectReport.syncIndexes(),
        User.syncIndexes(),
        SiteConfig.syncIndexes(),
        Member.syncIndexes(),
        Location.syncIndexes(),
        Leadership.syncIndexes(),
        QuoteSection.syncIndexes(),
        QuoteSubmission.syncIndexes(),
        Partner.syncIndexes(),
        Post.syncIndexes(),
        PostCategory.syncIndexes(),
        ProductColumn.syncIndexes(),
        VisitLog.syncIndexes(),
        MainTree.syncIndexes(),
        MarketTree.syncIndexes(),
      ]);
      logger.info('MongoDB indexes synced');

      const seed = await productColumnService.seedDefaults();
      logger.info({ skipped: seed.skipped, total: seed.total }, 'ProductColumn seed done');

      const { postCategoryService } = await import('./services/postCategory.service.js');
      const pcSeed = await postCategoryService.seedDefaults();
      logger.info({ skipped: pcSeed.skipped, total: pcSeed.total }, 'PostCategory seed done');

      const { migrationService } = await import('./services/migration.service.js');
      await migrationService.runHierarchyMigration();
    } catch (err) {
      logger.warn({ err: err.message }, 'Index sync / seed failed (continuing)');
    }
  })
  .catch((err) => {
    logger.error({ err: err.message }, 'DB connection failed');
    process.exit(1);
  });

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(requestLogger);

// Rate limit đặt TRƯỚC trackVisitor để request bị chặn không bị ghi log analytics.
app.use('/api', apiLimiter);

// Giới hạn riêng cho đăng nhập/đăng ký (chống brute-force mật khẩu).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Bạn thử đăng nhập quá nhiều lần, vui lòng thử lại sau.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(trackVisitor);
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Root-level SEO endpoints — serve sitemap.xml at /
app.use('/', publicSeoRoutes);

app.use('/api/public/products', publicRoutes);
app.use('/api/public/categories', publicCategoryRoutes);
app.use('/api/public/site-config', publicSiteConfigRoutes);
app.use('/api/public/members', publicMemberRoutes);
app.use('/api/public/locations', publicLocationRoutes);
app.use('/api/public/leadership', publicLeadershipRoutes);
app.use('/api/public/product-columns', publicProductColumnRoutes);
app.use('/api/public/quote-section', publicQuoteSectionRoutes);
app.use('/api/public/partners', publicPartnerRoutes);
app.use('/api/public/posts', publicPostRoutes);
app.use('/api/public/post-categories', publicPostCategoryRoutes);
app.use('/api/public/main-trees', publicMainTreeRoutes);
app.use('/api/public/market-trees', publicMarketTreeRoutes);
app.use('/api/public/markets', publicMarketRoutes);
app.use('/api/public/home', publicHomeRoutes);
app.use('/api/client/orders', clientOrderRoutes);
app.use('/api/client/quote-section', clientQuoteSectionRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/upload', adminUploadRoutes);
app.use('/api/admin/product-columns', adminProductColumnRoutes);
app.use('/api/admin/site-config', adminSiteConfigRoutes);
app.use('/api/admin/members', adminMemberRoutes);
app.use('/api/admin/locations', adminLocationRoutes);
app.use('/api/admin/leadership', adminLeadershipRoutes);
app.use('/api/admin/quote-section', adminQuoteSectionRoutes);
app.use('/api/admin/partners', adminPartnerRoutes);
app.use('/api/admin/posts', adminPostRoutes);
app.use('/api/admin/post-categories', adminPostCategoryRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/main-trees', adminMainTreeRoutes);
app.use('/api/admin/market-trees', adminMarketTreeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/project-reports', projectReportRoutes);

app.get('/api/health', (req, res) => apiResponse.ok(res, { status: 'OK', message: 'Server is running' }));

// OpenAPI/Swagger UI chỉ được public ở môi trường non-production.
// Ở production, chỉ admin có token mới xem được.
const docsEnabled = !isProduction || process.env.ENABLE_API_DOCS === 'true';

app.get('/api/openapi.json', async (req, res) => {
  if (!docsEnabled) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
  }
  res.json(swaggerSpec);
});

if (docsEnabled) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} (env=${process.env.NODE_ENV || 'development'})`);
});

// Cron: dọn VisitLog cũ + dựng snapshot online định kỳ.
startAnalyticsJobs();

// Bắt lỗi listen (EADDRINUSE…) — nếu không bắt, Node ném 'error' event chưa xử lý
// ⇒ process chết ngay ⇒ pm2/aaPanel restart liên tục ⇒ CPU 100%.
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(
      { port: PORT, err: err.message },
      `Port ${PORT} đang bị chiếm. Hãy dừng process cũ (pm2 delete <app>) hoặc đổi PORT.`
    );
  } else {
    logger.error({ err: err.message }, 'HTTP server error');
  }
  process.exit(1);
});

const shutdown = (signal) => {
  logger.info({ signal }, 'Đang tắt server...');
  stopAnalyticsJobs();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Log lỗi rồi thoát có kiểm soát thay vì crash im lặng (pm2 sẽ restart sạch).
process.on('uncaughtException', (err) => {
  logger.fatal({ err: err.message, stack: err.stack }, 'uncaughtException — thoát');
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason: reason?.message || String(reason) }, 'unhandledRejection — thoát');
  process.exit(1);
});

export default app;
