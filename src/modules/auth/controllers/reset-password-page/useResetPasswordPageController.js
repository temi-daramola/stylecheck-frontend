import { useResetPasswordForm, usePasswordVisibility } from '@/modules/auth/hooks';

export const useResetPasswordPageController = () => {
  const form = useResetPasswordForm();
  const password = usePasswordVisibility();
  return { ...form, ...password };
};
