import User from '../models/User.js';
import Article from '../models/Article.js';

// @desc    Get admin data (users, admins, articles, polls)
// @route   GET /api/admin
export const getAdminData = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (type === 'dashboard') {
      const totalArticlesCount = await Article.countDocuments({});
      const pendingArticlesCount = await Article.countDocuments({ status: 'pending' });
      const approvedArticlesCount = await Article.countDocuments({ status: 'approved' });
      const totalUsersCount = await User.countDocuments({});
      
      return res.json({
        success: true,
        stats: {
          totalArticlesCount,
          pendingArticlesCount,
          approvedArticlesCount,
          totalUsersCount
        }
      });
    }

    if (type === 'users') {
      if (!req.user.isSuperAdmin) return res.status(403).json({ success: false, error: 'Not authorized' });
      const users = await User.find({}).sort({ createdAt: -1 });
      return res.json({ success: true, users });
    }

    if (type === 'admins') {
      if (!req.user.isSuperAdmin) return res.status(403).json({ success: false, error: 'Not authorized' });
      const admins = await User.find({ $or: [{ isAdmin: true }, { isSuperAdmin: true }] }).sort({ createdAt: -1 });
      return res.json({ success: true, admins });
    }

    if (type === 'articles') {
      const articles = await Article.find({}).populate('user_id', 'name email admissionNumber role isCollegeVerified').sort({ createdAt: -1 });
      return res.json({ success: true, articles });
    }

    if (type === 'polls') {
      // Implement polls if they exist in new site (not in truncated plan so returning empty)
      return res.json({ success: true, polls: [] });
    }

    return res.status(400).json({ success: false, error: 'Invalid type' });
  } catch (error) {
    console.error('Admin get data error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Promote a user to admin
// @route   PUT /api/admin/promote/:id
export const promoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    user.isAdmin = true;
    await user.save();
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Demote an admin to user
// @route   PUT /api/admin/demote/:id
export const demoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.isSuperAdmin) return res.status(400).json({ success: false, error: 'Cannot demote super admin' });
    user.isAdmin = false;
    await user.save();
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.isSuperAdmin) return res.status(400).json({ success: false, error: 'Cannot delete super admin' });
    await User.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Approve an article
// @route   PUT /api/admin/articles/:id/approve
export const approveArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, error: 'Article not found' });
    article.status = 'approved';
    await article.save();
    return res.json({ success: true, article });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Delete an article
// @route   DELETE /api/admin/articles/:id
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, error: 'Article not found' });
    await Article.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Delete a poll
// @route   DELETE /api/admin/polls/:id
export const deletePoll = async (req, res) => {
  try {
    // Implement poll deletion if poll model exists
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
