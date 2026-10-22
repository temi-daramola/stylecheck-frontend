import { useMutationWithFeedback } from '@/common/hooks';
import { useSetCache } from '@/adapters/query';
import { QUERY_KEYS } from '@/common/constants';
import { uploadManualRequest } from '@/modules/settings/services/SettingsServices.js';
import { SettingsConstants } from '@/modules/settings/constants/SettingsConstants.js';

export const useUploadManual = () => {
  const setCache = useSetCache();

  return useMutationWithFeedback({
    mutationFn: uploadManualRequest,
    errorMessage: SettingsConstants.MESSAGES.UPLOAD_FALLBACK_ERROR,
    silentSuccess: true, // the page shows a success banner instead of a toast
    silentError: true, // and an inline error under the drop zone
    // The manual is replaced wholesale, so write the response straight into the cache. No refetch.
    onSuccessCache: (response) => setCache(QUERY_KEYS.MANUAL, response),
  });
};
