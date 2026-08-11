import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { verifyCollegeEmail } from '../controllers/verificationController.js';

const router = express.Router();

router.post('/', protect, verifyCollegeEmail);

export default router;
