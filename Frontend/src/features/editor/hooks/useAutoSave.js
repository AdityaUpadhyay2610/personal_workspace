import { useState, useRef, useEffect, useCallback } from 'react';
import documentServices from '../../../services/documentServices';

/**
 * Custom hook for handling debounced auto-saving with state management
 * @param {Object} activeDoc - Current active document object
 * @param {Function} onDocumentUpdated - Callback to notify parent of synced updates
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 600ms)
 * @param {boolean} isGuest - Flag whether user is in guest mode (skips DB updates)
 */
export function useAutoSave(activeDoc, onDocumentUpdated, debounceMs = 600, isGuest = false) {
  const [saveStatus, setSaveStatus] = useState(isGuest ? 'guest' : 'saved'); // 'saved' | 'saving' | 'error' | 'guest'
  const pendingChangesRef = useRef({});
  const timerRef = useRef(null);
  const activeDocIdRef = useRef(activeDoc?._id || activeDoc?.id);

  // Keep track of the active document id to avoid saving stale doc data across doc switching
  useEffect(() => {
    const currentId = activeDoc?._id || activeDoc?.id;
    if (currentId !== activeDocIdRef.current) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      pendingChangesRef.current = {};
      activeDocIdRef.current = currentId;
      setSaveStatus(isGuest ? 'guest' : 'saved');
    }
  }, [activeDoc?._id, activeDoc?.id, isGuest]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const saveToBackend = useCallback(
    async (docId, updates) => {
      if (isGuest) {
        setSaveStatus('guest');
        if (onDocumentUpdated) {
          onDocumentUpdated({ ...activeDoc, ...updates });
        }
        return;
      }

      if (!docId || Object.keys(updates).length === 0) return;
      setSaveStatus('saving');
      try {
        const updated = await documentServices.update(docId, updates);
        if (onDocumentUpdated) {
          onDocumentUpdated(updated);
        }
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to auto-save document:', err);
        setSaveStatus('error');
      }
    },
    [isGuest, activeDoc, onDocumentUpdated]
  );

  const queueAutoSave = useCallback(
    (updates) => {
      const docId = activeDoc?._id || activeDoc?.id;
      if (!docId) return;

      if (isGuest) {
        setSaveStatus('guest');
        if (onDocumentUpdated) {
          onDocumentUpdated({ ...activeDoc, ...updates });
        }
        return;
      }

      // Merge changes
      pendingChangesRef.current = {
        ...pendingChangesRef.current,
        ...updates,
      };

      setSaveStatus('saving');

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        const changesToSave = { ...pendingChangesRef.current };
        pendingChangesRef.current = {};
        saveToBackend(docId, changesToSave);
      }, debounceMs);
    },
    [activeDoc, isGuest, debounceMs, onDocumentUpdated, saveToBackend]
  );

  const saveImmediate = useCallback(
    async (updates) => {
      const docId = activeDoc?._id || activeDoc?.id;
      if (!docId) return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (isGuest) {
        setSaveStatus('guest');
        if (onDocumentUpdated) {
          onDocumentUpdated({ ...activeDoc, ...updates });
        }
        return;
      }

      const merged = {
        ...pendingChangesRef.current,
        ...updates,
      };
      pendingChangesRef.current = {};
      await saveToBackend(docId, merged);
    },
    [activeDoc, isGuest, onDocumentUpdated, saveToBackend]
  );

  return {
    saveStatus,
    queueAutoSave,
    saveImmediate,
  };
}

export default useAutoSave;
