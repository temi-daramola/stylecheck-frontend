import { useMutationWithFeedback } from '@/common/hooks';
import { useSetCache } from '@/adapters/query';
import { QUERY_KEYS } from '@/common/constants';
import { processManualRequest } from '@/modules/settings/services/SettingsServices.js';
import { SettingsConstants } from '@/modules/settings/constants/SettingsConstants.js';

/** "Process again": extracts the rules from the manual that is already saved, with no new upload. */
export const useProcessManual = () => {
  const setCache = useSetCache();

  return useMutationWithFeedback({
    mutationFn: processManualRequest,
    errorMessage: SettingsConstants.MESSAGES.PROCESS_FALLBACK_ERROR,
    silentSuccess: true,
    silentError: true,
    onSuccessCache: (response) => setCache(QUERY_KEYS.MANUAL, response),
  });
};
