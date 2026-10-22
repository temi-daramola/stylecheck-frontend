const REFERENCE_LENGTH = 8;
// Failures the user cannot fix themselves: worth a reference code so support can find the backend log line.
const SERVER_SIDE_CODES = ['EXTERNAL_SERVICE_ERROR', 'INTERNAL_ERROR', 'DB_OPERATION_FAILED'];

/** The backend's message, plus a short reference (the request id) for server-side failures. */
export const formatErrorMessage = (error, fallback) => {
  const message = error?.message ?? fallback;
  if (error?.requestId && SERVER_SIDE_CODES.includes(error.code)) {
    return `${message} (ref: ${String(error.requestId).slice(0, REFERENCE_LENGTH)})`;
  }
  return message;
};
