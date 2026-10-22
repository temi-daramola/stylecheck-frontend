import { Outlet } from '@/adapters/router';
import { ErrorBoundary } from '@/common/components';

export const AuthLayout = () => (
  <ErrorBoundary>
    <Outlet />
  </ErrorBoundary>
);
