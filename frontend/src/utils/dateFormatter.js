/**
 * Format a date to a human-readable string showing time ago
 * @param {string|Date} dateInput - The date to format
 * @returns {string} Formatted time ago string (e.g. "5 minutes ago")
 */
export const formatTimeAgo = (dateInput) => {
  try {
    const date = new Date(dateInput);
    const now = new Date();
    
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown date';
  }
};

/**
 * Format a date to a standard localized date string
 * @param {string|Date} dateInput - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput) => {
  try {
    const date = new Date(dateInput);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown date';
  }
};

/**
 * Format a date to a standard localized date and time string
 * @param {string|Date} dateInput - The date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateInput) => {
  try {
    const date = new Date(dateInput);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown date';
  }
};

/**
 * Get the relative day description (Today, Yesterday, etc.)
 * @param {string|Date} dateInput - The date to format
 * @returns {string} Day description
 */
export const getRelativeDay = (dateInput) => {
  try {
    const date = new Date(dateInput);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return formatDate(date);
    }
  } catch (error) {
    console.error('Error determining relative day:', error);
    return 'Unknown date';
  }
};
