import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    images: [{ type: String }],
    category: { type: String, default: '' },
    facebookUrl: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

postSchema.index({ slug: 1 });
postSchema.index({ isActive: 1, order: 1 });
postSchema.index({ publishedAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
