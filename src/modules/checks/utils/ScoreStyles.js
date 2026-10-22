import { SCORE_BANDS } from '@/common/constants';

/** Maps a 0-100 score to a COLORS tone: green >= 85, amber 60-84, red below. */
export const getScoreTone = (score) => {
  if (score >= SCORE_BANDS.FULL_MIN) return 'success';
  if (score >= SCORE_BANDS.PARTIAL_MIN) return 'warning';
  return 'error';
};

export const getBandTone = (band) => {
  if (band === SCORE_BANDS.FULL) return 'success';
  if (band === SCORE_BANDS.PARTIAL) return 'warning';
  return 'error';
};

export const getGreeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};
