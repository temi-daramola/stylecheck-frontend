export const ROUTES = Object.freeze({
  ROOT: '/',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  results: (checkId) => `/results/${checkId}`,
  share: (checkId) => `/share/${checkId}`,
  RESULTS_PATTERN: '/results/:checkId',
  SHARE_PATTERN: '/share/:checkId',
});

export const QUERY_KEYS = Object.freeze({
  MANUAL: ['style-manual'],
  PROFILE: ['supervisor-profile'],
  CHECKS: ['checks'],
  check: (checkId) => ['checks', checkId],
});

export const API_PATHS = Object.freeze({
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  PROFILE: '/supervisors/me',
  PREFERENCES: '/supervisors/me/preferences',
  MANUAL_ME: '/manuals/me',
  MANUALS: '/manuals',
  CHECKS: '/checks',
  check: (checkId) => `/checks/${checkId}`,
  checkPdf: (checkId) => `/checks/${checkId}/pdf`,
  checkShare: (checkId) => `/checks/${checkId}/share`,
});

export const FILE_LIMITS = Object.freeze({
  BYTES_PER_MB: 1024 * 1024,
  STUDENT_DOC_MAX_MB: 50,
  MANUAL_MAX_MB: 20,
  DOCX_EXTENSION: '.docx',
  MANUAL_EXTENSIONS: ['.pdf', '.docx'],
});

export const SCORE_BANDS = Object.freeze({
  FULL: 'Full Compliance',
  PARTIAL: 'Partial Compliance',
  NON_COMPLIANT: 'Non-Compliant',
  FULL_MIN: 85,
  PARTIAL_MIN: 60,
});
