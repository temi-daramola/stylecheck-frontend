import { Navigate, Outlet } from '@/adapters/router';
import { useAuth } from '@/application';
import { ROUTES } from '@/common/constants';

/** Requires NO session. A plain synchronous check of in-memory state: never triggers or waits on auto-login. */
export const GuestRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />;
};
