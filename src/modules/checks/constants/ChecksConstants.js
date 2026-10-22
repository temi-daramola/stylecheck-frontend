export const ChecksConstants = Object.freeze({
  // Must match the backend's CHAPTERS list.
  CHAPTER_ITEMS: Object.freeze(
    ['Chapter One', 'Chapter Two', 'Chapter Three', 'Chapter Four', 'Chapter Five', 'Proposal', 'Full Document'].map((name) => ({
      label: name,
      value: name,
    }))
  ),
  DEFAULT_CHAPTER: 'Chapter One',
  RECENT_PAGE_SIZE: 10,
  UPLOAD_PHASE: Object.freeze({ IDLE: 'idle', UPLOADING: 'uploading', ANALYSING: 'analysing' }),
  // Two ways the dashboard can be locked, in order: no manual at all, then a saved manual whose rules are not extracted yet.
  LOCK: Object.freeze({ NONE: 'none', MANUAL: 'manual', MANUAL_READY: 'manualReady' }),
  LOCK_PRESENTATION: Object.freeze({
    manual: {
      bannerTitle: 'No style manual uploaded yet',
      bannerText: "You must upload your institution's style manual before compliance checks can be run.",
      buttonLabel: 'Upload Style Manual',
      overlayText: 'Upload a style manual to unlock',
    },
    manualReady: {
      bannerTitle: 'Your style manual is saved but not processed yet',
      bannerText: 'Its style rules have not been extracted yet. Open Settings and choose "Process now" to unlock checks.',
      buttonLabel: 'Open Settings',
      overlayText: 'Process your style manual to unlock',
    },
  }),
  MESSAGES: Object.freeze({
    NAME_REQUIRED: 'Enter the student name',
    NAME_TOO_LONG: 'Student name is too long',
    CHAPTER_INVALID: 'Select a chapter or section',
    FILE_REQUIRED: 'Select a .docx file to check',
    FILE_TYPE: 'Only .docx files are accepted.',
    FILE_SIZE: 'This file is larger than 50 MB.',
    CHECK_FALLBACK_ERROR: 'The document could not be checked. Please try again.',
    RETRY_FALLBACK_ERROR: 'The analysis could not be completed. Please try again.',
    DOWNLOAD_FALLBACK_ERROR: 'The report could not be downloaded.',
    SHARE_FALLBACK_ERROR: 'The report could not be sent.',
    SHARE_SUCCESS_BANNER: 'Report sent successfully',
    EMAIL_REQUIRED: 'Enter the student email',
    EMAIL_INVALID: 'Enter a valid email address',
    MESSAGE_TOO_LONG: 'The message is too long (2000 characters max)',
  }),
  MAX_STUDENT_NAME_LENGTH: 200,
  MAX_SHARE_MESSAGE_LENGTH: 2000,
  SHARE_MESSAGE_PLACEHOLDER:
    'Hi, please review the attached style compliance report and fix the highlighted issues before resubmitting.',
});
