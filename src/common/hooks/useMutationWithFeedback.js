import { useSubmit } from '@/adapters/query';
import { notifySuccess, notifyError } from '@/adapters/notifications';

const DEFAULT_SUCCESS = 'Success.';
const DEFAULT_ERROR = 'Something went wrong. Please try again.';

/**
 * Runs the mutation, applies the cache update it is handed, and shows a toast.
 * The backend's own message always wins; `successMessage`/`errorMessage` are only fallbacks.
 * `silentSuccess` skips the success toast for flows that give their own feedback.
 */
export const useMutationWithFeedback = ({ mutationFn, onSuccessCache, successMessage, errorMessage, silentSuccess = false, silentError = false }) =>
  useSubmit(mutationFn, {
    onSuccess: (response, variables) => {
      onSuccessCache?.(response, variables);
      if (!silentSuccess) notifySuccess(response?.message || successMessage || DEFAULT_SUCCESS);
    },
    onError: (error) => {
      if (error?.code === 'REQUEST_CANCELLED' || silentError) return;
      notifyError(error?.message || errorMessage || DEFAULT_ERROR);
    },
  });
