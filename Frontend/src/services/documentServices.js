import api from './api';
import { validateDocumentData } from './validation';

/**
 * Document Service CRUD operations
 */
export const documentServices = {
  /**
   * Fetch list of all documents (for sidebar)
   */
  async getAll() {
    return api.get('/documents');
  },

  /**
   * Fetch a single full document by its ID
   */
  async getById(id) {
    if (!id) throw new Error('Document ID is required');
    return api.get(`/documents/${id}`);
  },

  /**
   * Create a new document
   */
  async create(data = {}) {
    const payload = {
      title: data.title || 'Untitled',
      icon: data.icon || '📝',
      coverImage: data.coverImage || '',
      content: data.content || [
        { id: crypto.randomUUID(), type: 'h1', text: 'Welcome to your new document' },
        { id: crypto.randomUUID(), type: 'paragraph', text: 'Start typing or press "/" to insert blocks...' },
      ],
    };
    const validationError = validateDocumentData(payload);
    if (validationError) throw new Error(validationError);
    return api.post('/documents', payload);
  },

  /**
   * Update an existing document by ID
   */
  async update(id, updates = {}) {
    if (!id) throw new Error('Document ID is required');
    const validationError = validateDocumentData(updates, { partial: true });
    if (validationError) throw new Error(validationError);
    return api.put(`/documents/${id}`, updates);
  },

  /**
   * Delete a document by ID
   */
  async delete(id) {
    if (!id) throw new Error('Document ID is required');
    return api.delete(`/documents/${id}`);
  },
};

export default documentServices;
