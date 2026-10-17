import { toast } from 'sonner';

/**
 * Maps DRF server validation error payloads (HTTP 400) into react-hook-form field errors
 * and triggers sonner toast notifications for field errors, non-field errors, and general details (SPEC F-13).
 *
 * @param {Error} error - Axios error object
 * @param {Function} [setError] - react-hook-form setError function
 * @param {string} [fallbackMessage] - Fallback toast text
 */
export function handleServerFormErrors(error, setError, fallbackMessage = 'Validation failed') {
  const data = error?.response?.data;

  if (!data || typeof data !== 'object') {
    const msg = error?.response?.data?.detail || error?.message || fallbackMessage;
    toast.error(msg);
    return msg;
  }

  const collectedMessages = [];

  Object.entries(data).forEach(([field, rawMessages]) => {
    let message = '';
    if (Array.isArray(rawMessages)) {
      message = rawMessages[0];
    } else if (typeof rawMessages === 'string') {
      message = rawMessages;
    } else if (typeof rawMessages === 'object' && rawMessages !== null) {
      const firstVal = Object.values(rawMessages)[0];
      message = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
    } else {
      message = String(rawMessages);
    }

    if (setError && field !== 'detail' && field !== 'non_field_errors') {
      setError(field, { type: 'server', message });
      collectedMessages.push(`${field}: ${message}`);
    } else {
      collectedMessages.push(message);
    }
  });

  const finalToast =
    collectedMessages.length > 0 ? collectedMessages.join(' | ') : fallbackMessage;

  toast.error(finalToast);
  return finalToast;
}
