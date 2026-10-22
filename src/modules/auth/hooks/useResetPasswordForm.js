import { createSchema, secret, sameAs } from '@/adapters/validation';
import { useNavigation, useQueryParams } from '@/adapters/router';
import { useForm, useMutationWithFeedback } from '@/common/hooks';
import { ROUTES } from '@/common/constants';
import { resetPasswordRequest } from '@/modules/auth/services/AuthServices.js';
import { AuthConstants } from '@/modules/auth/constants/AuthConstants.js';

const { MESSAGES, MIN_PASSWORD_LENGTH } = AuthConstants;

const resetSchema = createSchema({
  password: secret({
    required: MESSAGES.PASSWORD_REQUIRED,
    min: [MIN_PASSWORD_LENGTH, MESSAGES.PASSWORD_TOO_SHORT],
  }),
  confirmPassword: sameAs('password', MESSAGES.PASSWORD_MISMATCH).required(MESSAGES.CONFIRM_REQUIRED),
});

export const useResetPasswordForm = () => {
  const { get } = useQueryParams();
  const { replace } = useNavigation();
  const token = get('token');

  const { mutateAsync } = useMutationWithFeedback({
    mutationFn: resetPasswordRequest,
    silentSuccess: true,
    silentError: true,
  });

  const form = useForm({
    initialValues: { password: '', confirmPassword: '' },
    schema: resetSchema,
    onSubmit: async ({ password }) => {
      await mutateAsync({ token, password });
      replace(ROUTES.LOGIN, { passwordReset: true });
    },
  });

  // Links emailed by an admin's invitation carry invite=1, so the page can welcome a new supervisor.
  return { ...form, hasToken: Boolean(token), isInvite: get('invite') === '1' };
};
