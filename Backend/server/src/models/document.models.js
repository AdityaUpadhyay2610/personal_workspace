import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Untitled',
      trim: true,
    },
    icon: {
      type: String,
      default: '📝',
    },
    coverImage: {
      type: String,
      default: '',
    },
    content: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Document', documentSchema);