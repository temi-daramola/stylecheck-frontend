import { useFetch, useSetCache } from '@/adapters/query';
import { useMutationWithFeedback } from '@/common/hooks';
import { QUERY_KEYS } from '@/common/constants';
import { fetchProfile } from '@/common/services';
import { updatePreferencesRequest } from '@/modules/settings/services/SettingsServices.js';
import { SettingsConstants } from '@/modules/settings/constants/SettingsConstants.js';

export const usePreferences = () => {
  const setCache = useSetCache();
  const profileQuery = useFetch(QUERY_KEYS.PROFILE, fetchProfile);

  const mutation = useMutationWithFeedback({
    mutationFn: updatePreferencesRequest,
    successMessage: SettingsConstants.MESSAGES.PREFERENCE_SAVED,
    errorMessage: SettingsConstants.MESSAGES.PREFERENCE_FALLBACK_ERROR,
    // A preference change swaps one field in the cached profile: nothing about position or count changes.
    onSuccessCache: (response) =>
      setCache(QUERY_KEYS.PROFILE, (cached) =>
        cached ? { ...cached, data: { ...cached.data, preferences: response.data.preferences } } : cached
      ),
  });

  return {
    preferences: profileQuery.data?.preferences,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    retry: profileQuery.refetch,
    isSaving: mutation.isPending,
    setPreference: (key, value) => mutation.mutate({ [key]: value }),
  };
};
