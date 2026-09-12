import mongoose from 'mongoose';
import Document from '../models/document.models.js';

// Helper to check valid Mongo ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET all documents (id, title, icon, updatedAt for sidebar)
export const getAllDocuments = async (req, res) => {
  try {
    const docs = await Document.find({}, 'title icon updatedAt').sort({ updatedAt: -1 });
    return res.status(200).json(docs);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ error: 'Failed to fetch documents', details: error.message });
  }
};

// GET single document by ID
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid document ID format' });
    }

    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    return res.status(200).json(doc);
  } catch (error) {
    console.error('Error fetching document by ID:', error);
    return res.status(500).json({ error: 'Failed to fetch document', details: error.message });
  }
};

// POST create new document
export const createDocument = async (req, res) => {
  try {
    const { title, icon, coverImage, content } = req.body;
    const newDoc = await Document.create({
      title: title ?? 'Untitled',
      icon: icon ?? '📝',
      coverImage: coverImage ?? '',
      content: content ?? [],
    });
    return res.status(201).json(newDoc);
  } catch (error) {
    console.error('Error creating document:', error);
    return res.status(500).json({ error: 'Failed to create document', details: error.message });
  }
};

// PUT update document (title, icon, coverImage, or content)
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid document ID format' });
    }

    const updatedDoc = await Document.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ error: 'Document not found to update' });
    }

    return res.status(200).json(updatedDoc);
  } catch (error) {
    console.error('Error updating document:', error);
    return res.status(500).json({ error: 'Failed to update document', details: error.message });
  }
};

// DELETE a document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid document ID format' });
    }

    const deletedDoc = await Document.findByIdAndDelete(id);
    if (!deletedDoc) {
      return res.status(404).json({ error: 'Document not found to delete' });
    }

    return res.status(200).json({ message: 'Document deleted successfully', id });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ error: 'Failed to delete document', details: error.message });
  }
};