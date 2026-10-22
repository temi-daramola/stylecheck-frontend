import { useMutationWithFeedback } from '@/common/hooks';
import { useSetCache, useInvalidate } from '@/adapters/query';
import { QUERY_KEYS } from '@/common/constants';
import { uploadManualRequest } from '@/modules/settings/services/SettingsServices.js';
import { SettingsConstants } from '@/modules/settings/constants/SettingsConstants.js';

/**
 * Upload = save the text, then extract the rules, in one request. If only the second part fails the
 * manual is still saved on the server, so the cached manual is refreshed either way and the page can
 * show the real saved state.
 */
export const useUploadManual = () => {
  const setCache = useSetCache();
  const invalidate = useInvalidate();

  return useMutationWithFeedback({
    mutationFn: uploadManualRequest,
    errorMessage: SettingsConstants.MESSAGES.UPLOAD_FALLBACK_ERROR,
    silentSuccess: true, // the page shows a success banner instead of a toast
    silentError: true, // and an inline error under the drop zone
    onSuccessCache: (response) => setCache(QUERY_KEYS.MANUAL, response),
    onErrorCache: () => invalidate(QUERY_KEYS.MANUAL),
  });
};
