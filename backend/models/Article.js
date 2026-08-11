import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      enum: ['Campus', 'Sports', 'Events', 'Opinion', 'General'],
      default: 'Campus',
    },
    image_path: {
      type: String,
      default: '',
    },
    author_name: {
      type: String,
      default: 'Anonymous',
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['approved', 'pending'],
      default: 'approved',
    },
  },
  {
    timestamps: true,
  }
);

const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);

export default Article;
