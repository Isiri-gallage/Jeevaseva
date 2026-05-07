export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const URGENCY_LEVELS = ['low', 'medium', 'high', 'critical'];

export const URGENCY_COLORS = {
  low: '#27AE60',
  medium: '#F39C12',
  high: '#E67E22',
  critical: '#C0392B',
};

export const URGENCY_LABELS = {
  low: '🟢 Low',
  medium: '🟡 Medium',
  high: '🟠 High',
  critical: '🔴 Critical',
};

export const STATUS_COLORS = {
  open: '#27AE60',
  fulfilled: '#2980B9',
  expired: '#95A5A6',
  cancelled: '#E74C3C',
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};