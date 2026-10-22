import { useRouteLocation } from '@/adapters/router';
import { useLoginForm, usePasswordVisibility } from '@/modules/auth/hooks';
import { AuthConstants } from '@/modules/auth/constants/AuthConstants.js';

const { MESSAGES } = AuthConstants;

export const useLoginPageController = () => {
  const form = useLoginForm();
  const password = usePasswordVisibility();
  const { state } = useRouteLocation();

  // Why the user landed here: navigation state set by ProtectedRoute or the reset-password flow.
  const notice = state?.sessionExpired
    ? MESSAGES.SESSION_EXPIRED
    : state?.passwordReset
      ? MESSAGES.PASSWORD_RESET_DONE
      : null;
  const noticeStatus = state?.passwordReset ? 'success' : 'warning';

  return { ...form, ...password, notice, noticeStatus };
};
