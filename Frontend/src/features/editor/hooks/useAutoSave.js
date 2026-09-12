import { useState, useRef, useEffect, useCallback } from 'react';
import documentServices from '../../../services/documentServices';

/**
 * Custom hook for handling debounced auto-saving with state management
 * @param {Object} activeDoc - Current active document object
 * @param {Function} onDocumentUpdated - Callback to notify parent of synced updates
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 600ms)
 */
export function useAutoSave(activeDoc, onDocumentUpdated, debounceMs = 600) {
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'error' | 'idle'
  const pendingChangesRef = useRef({});
  const timerRef = useRef(null);
  const activeDocIdRef = useRef(activeDoc?._id);

  // Keep track of the active document id to avoid saving stale doc data across doc switching
  useEffect(() => {
    // If active doc changed, flush or reset pending timer
    if (activeDoc?._id !== activeDocIdRef.current) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      pendingChangesRef.current = {};
      activeDocIdRef.current = activeDoc?._id;
      setSaveStatus('saved');
    }
  }, [activeDoc?._id]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const saveToBackend = useCallback(async (docId, updates) => {
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
  }, [onDocumentUpdated]);

  const queueAutoSave = useCallback((updates) => {
    const docId = activeDoc?._id;
    if (!docId) return;

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
  }, [activeDoc?._id, debounceMs, saveToBackend]);

  const saveImmediate = useCallback(async (updates) => {
    const docId = activeDoc?._id;
    if (!docId) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const merged = {
      ...pendingChangesRef.current,
      ...updates,
    };
    pendingChangesRef.current = {};
    await saveToBackend(docId, merged);
  }, [activeDoc?._id, saveToBackend]);

  return {
    saveStatus,
    queueAutoSave,
    saveImmediate,
  };
}

export default useAutoSave;
