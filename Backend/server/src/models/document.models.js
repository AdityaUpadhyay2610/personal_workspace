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
      required: true,
      minlength: 1,
      maxlength: 200,
    },
    icon: {
      type: String,
      default: '📝',
      maxlength: 20,
    },
    coverImage: {
      type: String,
      default: '',
      maxlength: 500,
    },
    content: {
      type: Array,
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length <= 500,
        message: 'Document content cannot contain more than 500 blocks',
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Document', documentSchema);