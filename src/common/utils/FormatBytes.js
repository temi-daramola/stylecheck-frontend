const UNITS = ['B', 'KB', 'MB', 'GB'];
const STEP = 1024;

export const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(STEP)), UNITS.length - 1);
  const value = bytes / STEP ** index;
  return `${index === 0 ? value : value.toFixed(1)} ${UNITS[index]}`;
};
