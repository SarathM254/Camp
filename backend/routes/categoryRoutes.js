import express from 'express';
import Category from '../models/Category.js';
import { protect, superAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/categories - Public route to fetch all categories
router.get('/', async (req, res) => {
  try {
    // Auto-seed default categories if empty
    const count = await Category.countDocuments();
    if (count === 0) {
      const defaultCategories = [
        { name: 'Campus', slug: 'campus', order: 1 },
        { name: 'Sports', slug: 'sports', order: 2 },
        { name: 'Events', slug: 'events', order: 3 },
        { name: 'Opinion', slug: 'opinion', order: 4 }
      ];
      await Category.insertMany(defaultCategories);
    }

    const categories = await Category.find({ isActive: true }).sort({ order: 1 });
    
    // Add edge caching headers
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/categories - SuperAdmin only
router.post('/', protect, superAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Category already exists' });
    }

    const highestOrder = await Category.findOne().sort('-order');
    const newOrder = highestOrder ? highestOrder.order + 1 : 1;

    const category = await Category.create({
      name: name.trim(),
      order: newOrder
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error', stack: error.stack });
  }
});

// DELETE /api/categories/:id - SuperAdmin only
router.delete('/:id', protect, superAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category removed' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
