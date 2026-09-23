const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB, isMemoryMode } = require('./config/db');
const { initSeedData } = require('./services/store');

// Routes
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const orderRoutes = require('./routes/orderRoutes');
const walletRoutes = require('./routes/walletRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let isInitialized = false;
let initPromise = null;

const ensureInitialized = async () => {
  if (!isInitialized) {
    if (!initPromise) {
      initPromise = (async () => {
        await connectDB();
        await initSeedData();
        isInitialized = true;
      })();
    }
    await initPromise;
  }
};

// Ensure DB and seed data are ready before any API request
app.use(async (req, res, next) => {
  try {
    await ensureInitialized();
    next();
  } catch (err) {
    console.error('[Init Error]', err);
    next(err);
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    service: 'AccGlobal Account Marketplace Backend',
    mode: isMemoryMode() ? 'In-Memory Resilient Mode' : 'Live MongoDB Mode',
    version: '1.0.0'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await ensureInitialized();

  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });
};

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
