import { useState, useCallback } from 'react';
import { useMutationWithFeedback } from '@/common/hooks';
import { useInvalidate } from '@/adapters/query';
import { useNavigation } from '@/adapters/router';
import { QUERY_KEYS, ROUTES } from '@/common/constants';
import { formatErrorMessage } from '@/common/utils';
import { retryCheck } from '@/modules/checks/services/CheckServices.js';
import { ChecksConstants } from '@/modules/checks/constants/ChecksConstants.js';

/**
 * A check whose document was read and saved on the server but whose AI analysis did not finish.
 * Retrying re-runs only the AI step on the saved content: the document is not uploaded again.
 */
export const usePendingCheck = () => {
  const [pending, setPending] = useState(null); // { checkId, message, studentName }
  const invalidate = useInvalidate();
  const { goTo } = useNavigation();

  const { mutateAsync, isPending } = useMutationWithFeedback({
    mutationFn: retryCheck,
    errorMessage: ChecksConstants.MESSAGES.RETRY_FALLBACK_ERROR,
    silentSuccess: true, // the user is taken to the results page
    silentError: true, // the notice shows the new error
    onSuccessCache: () => invalidate(QUERY_KEYS.CHECKS),
  });

  const keep = useCallback((checkId, message, studentName) => setPending({ checkId, message, studentName }), []);
  const dismiss = useCallback(() => setPending(null), []);

  const retry = async () => {
    if (!pending) return;
    try {
      const response = await mutateAsync(pending.checkId);
      setPending(null);
      goTo(ROUTES.results(response.data.id));
    } catch (error) {
      setPending({ ...pending, message: formatErrorMessage(error, ChecksConstants.MESSAGES.RETRY_FALLBACK_ERROR) });
    }
  };

  return { pending, isRetrying: isPending, keep, dismiss, retry };
};
