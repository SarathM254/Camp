import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  isAiApprovalEnabled: {
    type: Boolean,
    default: false // Default to false for safety
  }
}, { timestamps: true });

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

export default Settings;
