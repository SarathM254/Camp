import Article from '../models/Article.js';

// @desc    Get all articles
// @route   GET /api/articles
export const getArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: 'approved' }).sort({ createdAt: -1 });
    return res.json({ success: true, articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching articles' });
  }
};

// @desc    Create an article
// @route   POST /api/articles
export const createArticle = async (req, res) => {
  try {
    const { title, body, tag, image_path } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, error: 'Title and body are required' });
    }

    const article = await Article.create({
      title,
      body,
      tag: tag || 'Campus',
      image_path: image_path || '',
      author_name: req.user ? req.user.name : 'Anonymous',
      user_id: req.user ? req.user._id : null,
      status: 'pending',
    });

    return res.status(201).json({ success: true, article });
  } catch (error) {
    console.error('Error creating article:', error);
    return res.status(500).json({ success: false, error: 'Server error creating article' });
  }
};
