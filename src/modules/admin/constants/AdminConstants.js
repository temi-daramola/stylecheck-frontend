export const AdminConstants = Object.freeze({
  MAX_NAME_LENGTH: 120,
  INVITE_VALID_HOURS: 72,
  MESSAGES: Object.freeze({
    NAME_REQUIRED: 'Enter the supervisor\'s name',
    NAME_TOO_LONG: 'Name is too long',
    EMAIL_REQUIRED: 'Enter the supervisor\'s email',
    EMAIL_INVALID: 'Enter a valid email address',
    ADD_FALLBACK_ERROR: 'The supervisor could not be added.',
    INVITE_FALLBACK_ERROR: 'The invitation could not be sent.',
    UPDATE_FALLBACK_ERROR: 'The account could not be updated.',
    INVITE_SENT: 'Invitation sent',
  }),
  CONFIRM_DEACTIVATE: (name) => ({
    title: 'Deactivate this supervisor?',
    message: `${name} will be signed out immediately and will not be able to sign in until you reactivate the account. Their past reports are kept.`,
    confirmLabel: 'Deactivate',
    tone: 'error',
  }),
});
