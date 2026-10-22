import { useState, useRef, useCallback } from 'react';
import { useMutationWithFeedback } from '@/common/hooks';
import { useInvalidate } from '@/adapters/query';
import { QUERY_KEYS } from '@/common/constants';
import { createCheck } from '@/modules/checks/services/CheckServices.js';
import { ChecksConstants } from '@/modules/checks/constants/ChecksConstants.js';

const { UPLOAD_PHASE, MESSAGES } = ChecksConstants;

/**
 * Upload state machine: idle -> uploading (real progress, cancellable) -> analysing (upload
 * finished, the server is running the AI check; not cancellable) -> done. A new check changes
 * what the list should contain, so the cached lists are invalidated on success.
 */
export const useCheckUpload = () => {
  const [phase, setPhase] = useState(UPLOAD_PHASE.IDLE);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef(null);
  const invalidate = useInvalidate();

  const { mutateAsync } = useMutationWithFeedback({
    mutationFn: createCheck,
    errorMessage: MESSAGES.CHECK_FALLBACK_ERROR,
    silentSuccess: true, // the user is taken to the results page instead
    silentError: true, // the form shows the error under the drop zone
    onSuccessCache: () => invalidate(QUERY_KEYS.CHECKS),
  });

  const reset = useCallback(() => {
    setPhase(UPLOAD_PHASE.IDLE);
    setProgress(0);
    abortRef.current = null;
  }, []);

  const run = useCallback(
    async ({ file, studentName, chapterSection }) => {
      const formData = new FormData();
      formData.set('studentName', studentName);
      formData.set('chapterSection', chapterSection);
      formData.set('document', file);

      abortRef.current = new AbortController();
      setProgress(0);
      setPhase(UPLOAD_PHASE.UPLOADING);

      try {
        return await mutateAsync({
          formData,
          signal: abortRef.current.signal,
          onProgress: (percent) => {
            setProgress(percent);
            if (percent >= 100) setPhase(UPLOAD_PHASE.ANALYSING);
          },
        });
      } finally {
        reset();
      }
    },
    [mutateAsync, reset]
  );

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  return { phase, progress, run, cancel, isBusy: phase !== UPLOAD_PHASE.IDLE };
};
