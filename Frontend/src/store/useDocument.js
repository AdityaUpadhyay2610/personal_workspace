/**
 * Document Store Helper
 * Can be extended for global state management if additional routes/views are added.
 */
import { useAutoSave } from '../features/editor/hooks/useAutoSave';
import { documentServices } from '../services/documentServices';

export { useAutoSave, documentServices };
export default documentServices;
