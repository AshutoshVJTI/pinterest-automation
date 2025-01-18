import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema); 