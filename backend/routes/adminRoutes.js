import express from 'express';
import { protect, admin, superAdmin } from '../middleware/authMiddleware.js';
import {
  getAdminData,
  promoteUser,
  demoteUser,
  deleteUser,
  approveArticle,
  deleteArticle,
  deletePoll
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/', protect, admin, getAdminData);
router.put('/promote/:id', protect, superAdmin, promoteUser);
router.put('/demote/:id', protect, superAdmin, demoteUser);
router.delete('/users/:id', protect, superAdmin, deleteUser);

router.put('/articles/:id/approve', protect, admin, approveArticle);
router.delete('/articles/:id', protect, admin, deleteArticle);

router.delete('/polls/:id', protect, admin, deletePoll);

export default router;
