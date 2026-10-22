import { Routes, Route, Navigate } from '@/adapters/router';
import { ProtectedRoute, GuestRoute, DashboardLayout, AuthLayout } from '@/layouts';
import { ROUTES } from '@/common/constants';
import { NotFoundPage } from '@/common/pages/NotFoundPage.jsx';
import { PublicRoutes } from './PublicRoutes.jsx';
import { DashboardRoutes } from './DashboardRoutes.jsx';

export const AppRoutes = () => (
  <Routes>
    <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.DASHBOARD} replace />} />

    <Route element={<GuestRoute />}>
      <Route element={<AuthLayout />}>{PublicRoutes()}</Route>
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>{DashboardRoutes()}</Route>
    </Route>

    {/* Everything else, outside ProtectedRoute: a bad URL shows 404 at once, without waiting on a session check. */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
