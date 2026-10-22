export const AuthConstants = Object.freeze({
  MIN_PASSWORD_LENGTH: 8,
  HERO: Object.freeze({
    BADGE: 'AI-Powered Compliance',
    TITLE: 'Ensure Every Document Meets the Standard',
    SUBTITLE: "Instantly check student project documents against your institution's style manual with AI precision.",
    STATS: Object.freeze([
      { value: '98%', label: 'Accuracy Rate' },
      { value: '2s', label: 'Average Check Time' },
      { value: '500+', label: 'Documents Checked' },
    ]),
  }),
  MESSAGES: Object.freeze({
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Enter a valid email address',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
    PASSWORD_MISMATCH: 'Passwords do not match',
    CONFIRM_REQUIRED: 'Confirm your new password',
    TOKEN_MISSING: 'This reset link is incomplete. Request a new one.',
    SESSION_EXPIRED: 'Your session expired. Please sign in again.',
    PASSWORD_RESET_DONE: 'Password reset. Sign in with your new password.',
  }),
});
