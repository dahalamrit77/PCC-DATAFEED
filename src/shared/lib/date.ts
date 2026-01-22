/**
 * Date utility functions
 * Centralized date formatting and manipulation
 */

import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format date to MM/dd/yyyy
 */
export const formatDate = (date: string | Date): string => {
  try {
    return format(new Date(date), 'MM/dd/yyyy');
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Format date and time to MM/dd/yyyy hh:mm a
 */
export const formatDateTime = (date: string | Date): string => {
  try {
    return format(new Date(date), 'MM/dd/yyyy hh:mm a');
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Format time to hh:mm a
 */
export const formatTime = (date: string | Date): string => {
  try {
    return format(new Date(date), 'hh:mm a');
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: string | Date): string => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
};

/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate: string | Date): number => {
  try {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  } catch {
    return 0;
  }
};
