import { createSchema, string, secret } from '@/adapters/validation';
import { useNavigation } from '@/adapters/router';
import { useAuth } from '@/application';
import { useForm } from '@/common/hooks';
import { ROUTES } from '@/common/constants';
import { AuthConstants } from '@/modules/auth/constants/AuthConstants.js';

const { MESSAGES } = AuthConstants;

const loginSchema = createSchema({
  email: string({ required: MESSAGES.EMAIL_REQUIRED, email: MESSAGES.EMAIL_INVALID }),
  password: secret({ required: MESSAGES.PASSWORD_REQUIRED }),
});

export const useLoginForm = () => {
  const { login } = useAuth();
  const { replace } = useNavigation();

  return useForm({
    initialValues: { email: '', password: '' },
    schema: loginSchema,
    onSubmit: async (values) => {
      await login(values); // rejects with the backend envelope on failure; useForm surfaces it
      replace(ROUTES.DASHBOARD);
    },
  });
};
