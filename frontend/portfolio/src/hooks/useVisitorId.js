import { useState, useEffect } from 'react';

const VISITOR_ID_STORAGE_KEY = 'devfolio_visitor_id';

/**
 * Generate a standard UUID v4 string.
 */
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Synchronous helper to get or initialize the visitor_id from localStorage.
 * Used by axios interceptors outside React components.
 */
export function getVisitorId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(VISITOR_ID_STORAGE_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(VISITOR_ID_STORAGE_KEY, id);
  }
  return id;
}

/**
 * Hook for React components needing the visitorId.
 */
export function useVisitorId() {
  const [visitorId, setVisitorId] = useState(getVisitorId);

  useEffect(() => {
    const id = getVisitorId();
    setVisitorId(id);
  }, []);

  return visitorId;
}

export default useVisitorId;
