import express from 'express';
import Settings from '../models/Settings.js';
import { protect, superAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to ensure settings exist
const getSettingsDoc = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

// GET /api/settings - SuperAdmin only
router.get('/', protect, superAdmin, async (req, res) => {
  try {
    const settings = await getSettingsDoc();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: 'Server error fetching settings' });
  }
});

// PUT /api/settings/ai-toggle - SuperAdmin only
router.put('/ai-toggle', protect, superAdmin, async (req, res) => {
  try {
    const { isAiApprovalEnabled } = req.body;
    
    if (typeof isAiApprovalEnabled !== 'boolean') {
      return res.status(400).json({ success: false, error: 'isAiApprovalEnabled must be a boolean' });
    }

    const settings = await getSettingsDoc();
    settings.isAiApprovalEnabled = isAiApprovalEnabled;
    await settings.save();

    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating AI toggle:', error);
    res.status(500).json({ success: false, error: 'Server error updating settings' });
  }
});

export default router;
