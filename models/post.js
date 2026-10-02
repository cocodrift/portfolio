const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    excerpt: {
      type: String,
      trim: true,
      maxlength: 320
    },

    content: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true,
      enum: [
        'Fitness',
        'Fashion',
        'Tech',
        'Lifestyle',
        'Travel'
      ]
    },

    tags: {
      type: [String],
      default: []
    },

    featuredImage: {
      type: String,
      default: ''
    },

    videoUrl: {
      type: String,
      default: ''
    },

    videoTitle: {
      type: String,
      default: ''
    },

    author: {
      type: String,
      default: 'M’s Hub KE'
    },

    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },

    seoTitle: {
      type: String,
      trim: true,
      maxlength: 160
    },

    seoDescription: {
      type: String,
      trim: true,
      maxlength: 320
    },

    publishedAt: {
      type: Date
    }
  },

  {
    timestamps: true
  }
);


PostSchema.index({
  status: 1,
  publishedAt: -1
});

PostSchema.index({
  category: 1,
  status: 1
});


module.exports = mongoose.model('Post', PostSchema);
