import express from 'express';
import { getArticles, createArticle } from '../controllers/articleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getArticles);
router.post('/', protect, createArticle);

export default router;
