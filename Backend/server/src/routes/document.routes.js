import express from 'express';
import {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from '../controllers/document.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createDocumentValidator, updateDocumentValidator } from '../validators/document.validator.js';

const router = express.Router();

// Enforce authentication on all document operations
router.use(authMiddleware);

router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.post('/', createDocumentValidator, validateRequest, createDocument);
router.put('/:id', updateDocumentValidator, validateRequest, updateDocument);
router.delete('/:id', deleteDocument);

export default router;