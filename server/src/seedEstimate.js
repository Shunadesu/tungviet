import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Estimate from './models/Estimate.js';

dotenv.config();

const sampleEstimates = [
  {
    stt: 1,
    feature: 'UI/UX Design',
    requirement: 'Design user interface for website',
    description: 'Create wireframes, mockups, and responsive layouts for all pages',
    complexity: 'Medium',
    estimatedHours: 24,
    hourlyRate: 450000,
    totalCost: 10800000,
    estimatedDays: 4,
    notes: '',
    product: '',
  },
  {
    stt: 2,
    feature: 'Frontend - Client Pages',
    requirement: 'Home, Products, Cart, Checkout, Order History',
    description: 'Build responsive client-facing pages with modern UI framework',
    complexity: 'Medium',
    estimatedHours: 40,
    hourlyRate: 450000,
    totalCost: 18000000,
    estimatedDays: 5,
    notes: '',
    product: '',
  },
  {
    stt: 3,
    feature: 'Frontend - Admin Dashboard',
    requirement: 'Product, Category, Order, Analytics management',
    description: 'Build admin dashboard with CRUD operations and data visualization',
    complexity: 'Medium',
    estimatedHours: 40,
    hourlyRate: 450000,
    totalCost: 18000000,
    estimatedDays: 5,
    notes: '',
    product: '',
  },
  {
    stt: 4,
    feature: 'Backend - Auth & Users',
    requirement: 'Login, Register, User roles & permissions',
    description: 'Implement authentication system with JWT, role-based access control',
    complexity: 'Medium',
    estimatedHours: 16,
    hourlyRate: 450000,
    totalCost: 7200000,
    estimatedDays: 2,
    notes: '',
    product: '',
  },
  {
    stt: 5,
    feature: 'Backend - Products & Categories',
    requirement: 'CRUD products, categories, search, filter',
    description: 'Build product management APIs with search and filtering capabilities',
    complexity: 'Medium',
    estimatedHours: 32,
    hourlyRate: 450000,
    totalCost: 14400000,
    estimatedDays: 4,
    notes: '',
    product: '',
  },
  {
    stt: 6,
    feature: 'Backend - Orders & Payments',
    requirement: 'Order processing, payment integration, status tracking',
    description: 'Implement order management with payment gateway integration',
    complexity: 'Medium',
    estimatedHours: 40,
    hourlyRate: 450000,
    totalCost: 18000000,
    estimatedDays: 5,
    notes: '',
    product: '',
  },
  {
    stt: 7,
    feature: 'Backend - Reports & Analytics',
    requirement: 'Revenue reports, product & customer stats',
    description: 'Build reporting system with charts and data analytics',
    complexity: 'Medium',
    estimatedHours: 24,
    hourlyRate: 450000,
    totalCost: 10800000,
    estimatedDays: 3,
    notes: '',
    product: '',
  },
  {
    stt: 8,
    feature: 'Database Design & Setup',
    requirement: 'Design and configure MongoDB database',
    description: 'Create database schema, indexes, and configuration',
    complexity: 'Medium',
    estimatedHours: 8,
    hourlyRate: 450000,
    totalCost: 3600000,
    estimatedDays: 1,
    notes: '',
    product: '',
  },
  {
    stt: 9,
    feature: 'Integration & Testing',
    requirement: 'System integration, bug fixing, QA',
    description: 'Integrate all modules, perform testing and bug fixes',
    complexity: 'Medium',
    estimatedHours: 40,
    hourlyRate: 450000,
    totalCost: 18000000,
    estimatedDays: 5,
    notes: '',
    product: '',
  },
  {
    stt: 10,
    feature: 'Training & Documentation',
    requirement: 'User guide, technical documentation',
    description: 'Create user manual and technical documentation',
    complexity: 'Medium',
    estimatedHours: 8,
    hourlyRate: 450000,
    totalCost: 3600000,
    estimatedDays: 1,
    notes: '',
    product: '',
  },
  {
    stt: 11,
    feature: 'Hosting & Deployment',
    requirement: 'Register hosting, deploy to server',
    description: 'Set up hosting, configure domain, and deploy application',
    complexity: 'Low',
    estimatedHours: 4,
    hourlyRate: 450000,
    totalCost: 1800000,
    estimatedDays: 1,
    notes: '',
    product: '',
  },
  {
    stt: 12,
    feature: 'Warranty (6 months)',
    requirement: 'Free maintenance after delivery',
    description: '6-month warranty covering bug fixes and minor updates',
    complexity: 'Low',
    estimatedHours: 0,
    hourlyRate: 450000,
    totalCost: 0,
    estimatedDays: 0,
    notes: 'Free',
    product: '',
  },
  {
    stt: 13,
    feature: 'Optional: SEO & Marketing Setup',
    requirement: 'SEO configuration, Google Analytics, marketing',
    description: 'Set up SEO meta tags, Google Analytics, and marketing tools',
    complexity: 'Medium',
    estimatedHours: 16,
    hourlyRate: 450000,
    totalCost: 7200000,
    estimatedDays: 2,
    notes: 'Optional',
    product: '',
  },
];

const run = async () => {
  try {
    await connectDB();

    await Estimate.deleteMany({});
    const estimates = await Estimate.insertMany(sampleEstimates);

    const totalHours = sampleEstimates.reduce((sum, e) => sum + e.estimatedHours, 0);
    const totalDays = sampleEstimates.reduce((sum, e) => sum + e.estimatedDays, 0);
    const totalCost = sampleEstimates.reduce((sum, e) => sum + e.totalCost, 0);

    console.log(`Created ${estimates.length} items`);
    console.log(`Total hours: ${totalHours}`);
    console.log(`Total days: ${totalDays}`);
    console.log(`Total cost: ${totalCost.toLocaleString('vi-VN')} VND`);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
