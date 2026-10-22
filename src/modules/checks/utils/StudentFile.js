import { FILE_LIMITS } from '@/common/constants';
import { ChecksConstants } from '@/modules/checks/constants/ChecksConstants.js';

const { MESSAGES } = ChecksConstants;

/** Browser-side checks only; the server validates again. Returns an error message or null. */
export const validateStudentFile = (file) => {
  if (!file.name.toLowerCase().endsWith(FILE_LIMITS.DOCX_EXTENSION)) return MESSAGES.FILE_TYPE;
  if (file.size > FILE_LIMITS.STUDENT_DOC_MAX_MB * FILE_LIMITS.BYTES_PER_MB) return MESSAGES.FILE_SIZE;
  return null;
};
