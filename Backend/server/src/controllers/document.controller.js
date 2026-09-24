import mongoose from 'mongoose';
import Document from '../models/document.models.js';
import { validateDocumentInput } from '../utils/validation.js';

// Helper to check valid Mongo ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET all documents for the authenticated user (id, title, icon, updatedAt for sidebar)
export const getAllDocuments = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const docs = await Document.find({ userId }, 'title icon updatedAt').sort({ updatedAt: -1 });
    return res.status(200).json(docs);
  } catch (error) {
    console.error('Error fetching user documents:', error);
    return res.status(500).json({ error: 'Failed to fetch documents', details: error.message });
  }
};

// GET single document by ID (strictly isolated to owner user)
export const getDocumentById = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid document ID format' });
    }

    const doc = await Document.findOne({ _id: id, userId });
    if (!doc) {
      return res.status(404).json({ error: 'Document not found or access denied' });
    }

    return res.status(200).json(doc);
  } catch (error) {
    console.error('Error fetching document by ID:', error);
    return res.status(500).json({ error: 'Failed to fetch document', details: error.message });
  }
};

// POST create new document for the authenticated user
export const createDocument = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const { title, icon, coverImage, content } = req.body;
    const payload = {
      title: title ?? 'Untitled',
      icon: icon ?? '📝',
      coverImage: coverImage ?? '',
      content: content ?? [],
    };
    const validationErrors = validateDocumentInput(payload);
    if (Object.keys(validationErrors).length > 0) return res.status(400).json({ error: 'Invalid document data', fields: validationErrors });
    const newDoc = await Document.create({
      userId,
      title: payload.title.trim(),
      icon: payload.icon,
      coverImage: payload.coverImage,
      content: payload.content,
    });

    return res.status(201).json(newDoc);
  } catch (error) {
    console.error('Error creating document:', error);
    return res.status(500).json({ error: 'Failed to create document', details: error.message });
  }
};

// PUT update document (strictly isolated to owner user)
export const updateDocument = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid document ID format' });
    }

    // Disallow overriding userId
    const updates = { ...req.body };
    delete updates.userId;
    const validationErrors = validateDocumentInput(updates, { partial: true });
    if (Object.keys(validationErrors).length > 0) return res.status(400).json({ error: 'Invalid document data', fields: validationErrors });
    if (updates.title !== undefined) updates.title = updates.title.trim();

    const updatedDoc = await Document.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ error: 'Document not found to update or access denied' });
    }

    return res.status(200).json(updatedDoc);
  } catch (error) {
    console.error('Error updating document:', error);
    if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ error: 'Invalid document data', details: error.message });
    return res.status(500).json({ error: 'Failed to update document', details: error.message });
  }
};

// DELETE a document (strictly isolated to owner user)
export const deleteDocument = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid document ID format' });
    }

    const deletedDoc = await Document.findOneAndDelete({ _id: id, userId });
    if (!deletedDoc) {
      return res.status(404).json({ error: 'Document not found to delete or access denied' });
    }

    return res.status(200).json({ message: 'Document deleted successfully', id });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ error: 'Failed to delete document', details: error.message });
  }
};