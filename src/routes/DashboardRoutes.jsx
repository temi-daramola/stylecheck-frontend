import { lazy, Suspense } from 'react';
import { Route } from '@/adapters/router';
import { LoadingNotify } from '@/common/components';
import { ROUTES } from '@/common/constants';
import { NotFoundPage } from '@/common/pages/NotFoundPage.jsx';

const DashboardPage = lazy(() => import('@/modules/checks').then((m) => ({ default: m.DashboardPage })));
const ResultsPage = lazy(() => import('@/modules/checks').then((m) => ({ default: m.ResultsPage })));
const SharePage = lazy(() => import('@/modules/checks').then((m) => ({ default: m.SharePage })));
const SettingsPage = lazy(() => import('@/modules/settings').then((m) => ({ default: m.SettingsPage })));

const withSuspense = (element) => <Suspense fallback={<LoadingNotify title="Loading..." />}>{element}</Suspense>;

export const DashboardRoutes = () => (
  <>
    <Route path={ROUTES.DASHBOARD} element={withSuspense(<DashboardPage />)} />
    <Route path={ROUTES.RESULTS_PATTERN} element={withSuspense(<ResultsPage />)} />
    <Route path={ROUTES.SHARE_PATTERN} element={withSuspense(<SharePage />)} />
    <Route path={ROUTES.SETTINGS} element={withSuspense(<SettingsPage />)} />
    {/* Unmatched path INSIDE the signed-in area: still rendered within the layout, so the navbar stays usable. */}
    <Route path="*" element={<NotFoundPage />} />
  </>
);
