import { get, post, uploadForm, downloadFile } from '@/adapters/http';
import { API_PATHS } from '@/common/constants';

export const fetchChecks = ({ page, pageSize }) => get(API_PATHS.CHECKS, { params: { page, pageSize } });
export const fetchCheck = (checkId) => get(API_PATHS.check(checkId));

/** Multipart upload with progress and cancellation. `signal` is an AbortSignal. */
export const createCheck = ({ formData, onProgress, signal }) =>
  uploadForm(API_PATHS.CHECKS, formData, { onProgress, signal });

/** Re-runs the AI step on a saved check whose earlier attempt failed. */
export const retryCheck = (checkId) => post(API_PATHS.checkRetry(checkId));
export const downloadCheckReport = (checkId) => downloadFile(API_PATHS.checkPdf(checkId));
export const shareCheck = ({ checkId, studentEmail, message }) =>
  post(API_PATHS.checkShare(checkId), { studentEmail, message });
