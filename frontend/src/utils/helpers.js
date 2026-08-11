export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const URGENCY_LEVELS = ['low', 'medium', 'high', 'critical'];

/*
 * Status and urgency map to Badge *variants*, not colours.
 *
 * The old version stored hex codes here (`critical: '#C0392B'`), which meant a
 * page had to know both the status and how to paint it — and those colours were
 * unreadable once dark mode arrived. Now the component picks a variant and the
 * token layer decides what that looks like in each appearance.
 */
export const URGENCY_VARIANTS = {
  low: 'success',
  medium: 'warning',
  high: 'warning',
  critical: 'danger',
};

export const URGENCY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const REQUEST_STATUS_VARIANTS = {
  open: 'success',
  fulfilled: 'accent',
  expired: 'neutral',
  cancelled: 'danger',
};

export const REQUEST_STATUS_LABELS = {
  open: 'Open',
  fulfilled: 'Fulfilled',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

export const DONATION_STATUS_VARIANTS = {
  pending: 'warning',
  confirmed: 'accent',
  completed: 'success',
  cancelled: 'danger',
};

export const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const getTimeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(seconds / 86400);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};
