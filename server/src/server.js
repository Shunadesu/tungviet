import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import routes
import publicRoutes from './routes/public/product.routes.js';
import publicCategoryRoutes from './routes/public/category.routes.js';
import clientOrderRoutes from './routes/client/order.routes.js';
import adminProductRoutes from './routes/admin/product.routes.js';
import adminCategoryRoutes from './routes/admin/category.routes.js';
import adminOrderRoutes from './routes/admin/order.routes.js';
import authRoutes from './routes/auth.routes.js';
import estimateRoutes from './routes/estimate.routes.js';

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/public/products', publicRoutes);
app.use('/api/public/categories', publicCategoryRoutes);
app.use('/api/client/orders', clientOrderRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/estimates', estimateRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
