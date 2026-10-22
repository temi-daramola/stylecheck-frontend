import { Navigate, Outlet } from '@/adapters/router';
import { useAuth } from '@/application';
import { ROUTES } from '@/common/constants';

/** Inside ProtectedRoute. Only a convenience: the server independently refuses every admin request from a non-admin. */
export const AdminRoute = () => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <Outlet /> : <Navigate to={ROUTES.DASHBOARD} replace />;
};
