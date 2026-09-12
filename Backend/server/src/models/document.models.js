import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
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