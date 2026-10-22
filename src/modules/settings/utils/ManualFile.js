import { FILE_LIMITS } from '@/common/constants';
import { SettingsConstants } from '@/modules/settings/constants/SettingsConstants.js';

const { FILE_TYPES, MESSAGES } = SettingsConstants;

/** 'pdf' | 'docx' from the file name, or null when it is neither. */
export const getManualFileType = (file) => {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return FILE_TYPES.PDF;
  if (name.endsWith('.docx')) return FILE_TYPES.DOCX;
  return null;
};

/** Browser-side checks only. The server independently validates the text it receives. Returns an error message or null. */
export const validateManualFile = (file) => {
  if (!getManualFileType(file)) return MESSAGES.UNSUPPORTED_TYPE;
  if (file.size > FILE_LIMITS.MANUAL_MAX_MB * FILE_LIMITS.BYTES_PER_MB) return MESSAGES.TOO_LARGE;
  return null;
};

export const validateExtractedText = (text) => {
  const length = text.trim().length;
  if (length < SettingsConstants.MIN_TEXT_LENGTH) return MESSAGES.NO_READABLE_TEXT;
  if (length > SettingsConstants.MAX_TEXT_LENGTH) return MESSAGES.TOO_LONG;
  return null;
};
