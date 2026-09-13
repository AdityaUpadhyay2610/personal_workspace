import express from 'express';
import {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from '../controllers/document.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Enforce authentication on all document operations
router.use(authMiddleware);

router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.post('/', createDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;