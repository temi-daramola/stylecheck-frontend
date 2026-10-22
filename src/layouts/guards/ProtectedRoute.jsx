import { useEffect } from 'react';
import { Navigate, Outlet } from '@/adapters/router';
import { useAuth, AUTH_STATUS } from '@/application';
import { ROUTES } from '@/common/constants';
import { AuthLoadingLayout } from '@/layouts/_common/AuthLoadingLayout.jsx';

/** Requires a session. The only place auto-login (refresh via the httpOnly cookie) is triggered. */
export const ProtectedRoute = () => {
  const { status, isAuthenticated, isSessionExpired, autoLoginError, attemptAutoLogin } = useAuth();

  useEffect(() => {
    if (status === AUTH_STATUS.UNKNOWN) attemptAutoLogin();
  }, [status, attemptAutoLogin]);

  if (status === AUTH_STATUS.ERROR) {
    return <AuthLoadingLayout error={autoLoginError} onRetry={attemptAutoLogin} />;
  }

  if (status === AUTH_STATUS.UNKNOWN || status === AUTH_STATUS.CHECKING) {
    return <AuthLoadingLayout />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ sessionExpired: isSessionExpired }} />;
  }

  return <Outlet />;
};
