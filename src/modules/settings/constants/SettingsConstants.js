export const SettingsConstants = Object.freeze({
  // Must match the backend's MIN_EXTRACTED_TEXT_LENGTH / MAX_MANUAL_TEXT_LENGTH.
  MIN_TEXT_LENGTH: 200,
  MAX_TEXT_LENGTH: 500000,
  FILE_TYPES: Object.freeze({ PDF: 'pdf', DOCX: 'docx' }),
  // Errors that mean the request was refused before anything was saved; every other upload error happened
  // after the file was saved on the server.
  NOT_SAVED_CODES: Object.freeze(['VALIDATION_ERROR', 'UNAUTHORIZED', 'FORBIDDEN', 'RATE_LIMITED', 'NETWORK_ERROR', 'UNEXPECTED_RESPONSE']),
  PREFERENCES: Object.freeze([
    { key: 'emailNotifications', label: 'Email notifications for completed checks' },
    { key: 'showScoreOnDashboard', label: 'Show compliance score on dashboard' },
  ]),
  MESSAGES: Object.freeze({
    UNSUPPORTED_TYPE: 'Only PDF or DOCX files are supported.',
    TOO_LARGE: 'This file is larger than 20 MB.',
    NO_READABLE_TEXT: 'This file has no readable text. Please upload a text-based PDF.',
    TOO_LONG: 'This style manual is too long to process.',
    UPLOAD_SUCCESS_BANNER: 'Style manual updated successfully',
    PROCESS_SUCCESS_BANNER: 'Style manual processed successfully',
    SAVED_BUT_FAILED: 'Your file was saved, but its style rules could not be extracted yet.',
    PROCESS_FALLBACK_ERROR: 'The style manual could not be processed. Please try again.',
    UPLOAD_FALLBACK_ERROR: 'The style manual could not be processed. Please try again.',
    PREFERENCE_FALLBACK_ERROR: 'Could not save your preference.',
    PREFERENCE_SAVED: 'Preference saved',
  }),
});
