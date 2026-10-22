import { createSchema, string } from '@/adapters/validation';
import { useInvalidate } from '@/adapters/query';
import { notifySuccess, notifyWarning } from '@/adapters/notifications';
import { useForm, useMutationWithFeedback } from '@/common/hooks';
import { QUERY_KEYS } from '@/common/constants';
import { createSupervisor } from '@/modules/admin/services/AdminServices.js';
import { AdminConstants } from '@/modules/admin/constants/AdminConstants.js';

const { MESSAGES, MAX_NAME_LENGTH } = AdminConstants;

const addSchema = createSchema({
  name: string({ required: MESSAGES.NAME_REQUIRED, max: [MAX_NAME_LENGTH, MESSAGES.NAME_TOO_LONG] }),
  email: string({ required: MESSAGES.EMAIL_REQUIRED, email: MESSAGES.EMAIL_INVALID }),
});

export const useAddSupervisorForm = () => {
  const invalidate = useInvalidate();

  const { mutateAsync } = useMutationWithFeedback({
    mutationFn: createSupervisor,
    errorMessage: MESSAGES.ADD_FALLBACK_ERROR,
    silentSuccess: true, // the account exists either way; whether the email went out decides the toast below
    silentError: true, // useForm shows the error (for example a duplicate email) under the form
    // A new account's position in the list cannot be guessed, so refetch instead of patching.
    onSuccessCache: () => invalidate(QUERY_KEYS.ADMIN_SUPERVISORS),
  });

  return useForm({
    initialValues: { name: '', email: '' },
    schema: addSchema,
    resetOnSuccess: true,
    onSubmit: async (values) => {
      const response = await mutateAsync(values);
      // The backend creates the account even if the email fails, and says so in `inviteSent`.
      (response.data.inviteSent ? notifySuccess : notifyWarning)(response.message);
    },
  });
};
