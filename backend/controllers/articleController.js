import Article from '../models/Article.js';
import Settings from '../models/Settings.js';
import { moderateTextWithGroq, moderateImageWithGemini } from '../utils/aiModeration.js';

// @desc    Get all articles
// @route   GET /api/articles
export const getArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: 'approved' }).sort({ createdAt: -1 });
    return res.json({ success: true, articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error fetching articles', stack: error.stack });
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

    // Default status is pending
    let finalStatus = 'pending';
    let aiRejectionReason = null;

    // Check if AI is enabled
    let settings = await Settings.findOne();
    if (!settings) {
      settings = { isAiApprovalEnabled: false };
    }

    if (settings.isAiApprovalEnabled) {
      try {
        // Run AI checks with a 7-second timeout wrapper to prevent Vercel 504 errors
        const aiCheckPromise = (async () => {
          // 1. Text Check (Groq)
          const textResult = await moderateTextWithGroq(`${title}\n${body}`);
          if (!textResult.isApproved) {
            return { approved: false, reason: textResult.reason };
          }
          
          // 2. Image Check (Gemini) if image exists
          if (image_path) {
            // Need absolute URL for Gemini if it's a relative path from our own server
            // But Cloudinary returns absolute HTTPS URLs, so we pass it directly
            const imgUrl = image_path.startsWith('http') ? image_path : `${req.protocol}://${req.get('host')}${image_path}`;
            const imageResult = await moderateImageWithGemini(imgUrl);
            if (!imageResult.isApproved) {
              return { approved: false, reason: imageResult.reason };
            }
          }

          return { approved: true, reason: null };
        })();

        // Create a timeout promise (7 seconds)
        const timeoutPromise = new Promise((resolve) => 
          setTimeout(() => resolve({ timeout: true }), 7000)
        );

        // Race the AI check against the timeout
        const result = await Promise.race([aiCheckPromise, timeoutPromise]);

        if (result.timeout) {
          console.warn('AI moderation timed out (7s). Falling back to manual pending status.');
          // finalStatus remains 'pending'
        } else if (result.approved) {
          finalStatus = 'approved';
        } else {
          finalStatus = 'rejected';
          aiRejectionReason = result.reason;
        }

      } catch (aiError) {
        console.error('AI Moderation failed entirely. Falling back to pending.', aiError);
        // finalStatus remains 'pending'
      }
    }

    // Do not save to DB if rejected, or save as rejected? 
    // Usually, rejected posts are not saved to keep DB clean, but we can save it as 'rejected' for logs.
    // Let's not save it if AI explicitly rejected it, just throw error to user.
    if (finalStatus === 'rejected') {
      return res.status(403).json({ 
        success: false, 
        error: 'Your article was rejected by AI moderation.', 
        reason: aiRejectionReason 
      });
    }

    const article = await Article.create({
      title,
      body,
      tag: tag || 'Campus',
      image_path: image_path || '',
      author_name: req.user ? req.user.name : 'Anonymous',
      user_id: req.user ? req.user._id : null,
      status: finalStatus,
    });

    return res.status(201).json({ 
      success: true, 
      article, 
      status: finalStatus,
      message: finalStatus === 'approved' 
        ? 'Article automatically approved and published by AI.' 
        : 'Article submitted successfully and is pending manual review.'
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return res.status(500).json({ success: false, error: 'Server error creating article' });
  }
};
