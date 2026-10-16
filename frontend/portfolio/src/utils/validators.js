import { z } from 'zod';

/**
 * Validation schemas matching backend constraints (SPEC B-21, F-11, F-12)
 */

// Contact Form validation
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message cannot exceed 2000 characters'),
});

// Comment Form validation
export const commentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  website: z.string().url('Must be a valid URL (include https://)').optional().or(z.literal('')),
  content: z.string().min(5, 'Comment must be at least 5 characters').max(1000, 'Comment cannot exceed 1000 characters'),
});

// Login Form validation
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Change Password validation
export const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
});

/**
 * Helper to extract DRF field errors or generic message
 * @param {any} error Axios error object
 * @returns {{ fieldErrors: Record<string, string>, message: string }}
 */
export function parseApiError(error) {
  if (!error.response) {
    return {
      fieldErrors: {},
      message: error.message || 'Network error. Please check your connection.',
    };
  }

  const { data, status } = error.response;
  const fieldErrors = {};
  let message = 'An unexpected error occurred.';

  if (status === 429) {
    return {
      fieldErrors: {},
      message: data.detail || 'Too many attempts, please try later.',
    };
  }

  if (typeof data === 'string') {
    return { fieldErrors: {}, message: data };
  }

  if (typeof data === 'object' && data !== null) {
    if (data.detail && typeof data.detail === 'string') {
      message = data.detail;
    }

    for (const [key, val] of Object.entries(data)) {
      if (key === 'detail') continue;
      if (Array.isArray(val)) {
        fieldErrors[key] = val[0];
      } else if (typeof val === 'string') {
        fieldErrors[key] = val;
      }
    }
  }

  return { fieldErrors, message };
}
