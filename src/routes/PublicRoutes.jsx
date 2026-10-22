import { lazy, Suspense } from 'react';
import { Route } from '@/adapters/router';
import { LoadingNotify } from '@/common/components';
import { ROUTES } from '@/common/constants';

const LoginPage = lazy(() => import('@/modules/auth').then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('@/modules/auth').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/modules/auth').then((m) => ({ default: m.ResetPasswordPage })));

const withSuspense = (element) => <Suspense fallback={<LoadingNotify title="Loading..." minHeight="100vh" justify="center" />}>{element}</Suspense>;

export const PublicRoutes = () => (
  <>
    <Route path={ROUTES.LOGIN} element={withSuspense(<LoginPage />)} />
    <Route path={ROUTES.FORGOT_PASSWORD} element={withSuspense(<ForgotPasswordPage />)} />
    <Route path={ROUTES.RESET_PASSWORD} element={withSuspense(<ResetPasswordPage />)} />
  </>
);
