import { post, patch } from '@/adapters/http';
import { API_PATHS } from '@/common/constants';

/** Sends the text extracted in the browser. The file itself never leaves the browser. */
export const uploadManualRequest = (body) => post(API_PATHS.MANUALS, body);
/** Processes the saved manual again after a failed attempt: no new upload. */
export const processManualRequest = () => post(API_PATHS.MANUAL_PROCESS);
export const updatePreferencesRequest = (preferences) => patch(API_PATHS.PREFERENCES, preferences);
