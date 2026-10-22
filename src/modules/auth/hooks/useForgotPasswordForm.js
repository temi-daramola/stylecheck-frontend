import { useState } from 'react';
import { createSchema, string } from '@/adapters/validation';
import { useForm, useMutationWithFeedback } from '@/common/hooks';
import { forgotPasswordRequest } from '@/modules/auth/services/AuthServices.js';
import { AuthConstants } from '@/modules/auth/constants/AuthConstants.js';

const { MESSAGES } = AuthConstants;

const forgotSchema = createSchema({
  email: string({ required: MESSAGES.EMAIL_REQUIRED, email: MESSAGES.EMAIL_INVALID }),
});

export const useForgotPasswordForm = () => {
  const [sentTo, setSentTo] = useState('');
  const { mutateAsync } = useMutationWithFeedback({
    mutationFn: forgotPasswordRequest,
    silentSuccess: true, // the page shows its own confirmation
    silentError: true, // useForm shows the error under the form
  });

  const form = useForm({
    initialValues: { email: '' },
    schema: forgotSchema,
    onSubmit: async ({ email }) => {
      await mutateAsync({ email });
      setSentTo(email);
    },
  });

  return { ...form, sentTo };
};
