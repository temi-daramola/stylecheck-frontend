import { useState } from 'react';
import { createSchema, string } from '@/adapters/validation';
import { useSetCache } from '@/adapters/query';
import { useForm, useMutationWithFeedback } from '@/common/hooks';
import { QUERY_KEYS } from '@/common/constants';
import { shareCheck } from '@/modules/checks/services/CheckServices.js';
import { ChecksConstants } from '@/modules/checks/constants/ChecksConstants.js';

const { MESSAGES, MAX_SHARE_MESSAGE_LENGTH } = ChecksConstants;

const shareSchema = createSchema({
  studentEmail: string({ required: MESSAGES.EMAIL_REQUIRED, email: MESSAGES.EMAIL_INVALID }),
  message: string({ max: [MAX_SHARE_MESSAGE_LENGTH, MESSAGES.MESSAGE_TOO_LONG] }),
});

export const useShareForm = (checkId) => {
  const [isSent, setIsSent] = useState(false);
  const setCache = useSetCache();

  const { mutateAsync } = useMutationWithFeedback({
    mutationFn: shareCheck,
    errorMessage: MESSAGES.SHARE_FALLBACK_ERROR,
    silentSuccess: true, // the page shows a success banner
    silentError: true, // useForm shows the error under the form
    // The response is the updated check (sharedWithStudent now true): swap it into the cached detail.
    onSuccessCache: (response) => setCache(QUERY_KEYS.check(checkId), response),
  });

  const form = useForm({
    initialValues: { studentEmail: '', message: '' },
    schema: shareSchema,
    onSubmit: async (values) => {
      setIsSent(false);
      await mutateAsync({ checkId, ...values });
      setIsSent(true);
    },
  });

  return { ...form, isSent };
};
