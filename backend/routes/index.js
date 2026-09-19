import express from 'express';
import authRoutes from './authRoutes.js';
import articleRoutes from './articleRoutes.js';

import adminRoutes from './adminRoutes.js';
import verificationRoutes from './verificationRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import settingsRoutes from './settingsRoutes.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
router.use('/admin', adminRoutes);
router.use('/verify', verificationRoutes);
router.use('/upload', uploadRoutes);
router.use('/categories', categoryRoutes);
router.use('/settings', settingsRoutes);

export default router;
