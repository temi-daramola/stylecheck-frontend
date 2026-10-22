import { Stack, Box, Heading, Text, Button, InlineAlert, Link } from '@/common/components';
import { COLORS, ROUTES } from '@/common/constants';
import { ArrowLeftIcon } from '@/adapters/icons';
import { AuthSplitLayout } from '@/modules/auth/components/AuthSplitLayout.jsx';
import { PasswordInput } from '@/modules/auth/components/PasswordInput.jsx';
import { useResetPasswordPageController } from '@/modules/auth/controllers/reset-password-page/useResetPasswordPageController.js';
import { AuthConstants } from '@/modules/auth/constants/AuthConstants.js';

export const ResetPasswordPage = () => {
  const { values, errors, formError, isSubmitting, handleChange, handleSubmit, hasToken, isVisible, toggleVisibility } =
    useResetPasswordPageController();

  return (
    <AuthSplitLayout>
      <Box mb="8">
        <Heading as="h2" fontSize="28px" fontWeight="800" letterSpacing="-0.02em" color={COLORS.body.heading} mb="2">
          Choose a new password
        </Heading>
        <Text color={COLORS.body.muted}>Use at least 8 characters. You will be signed out everywhere else.</Text>
      </Box>

      {!hasToken ? (
        <Stack gap="4">
          <InlineAlert status="error" description={AuthConstants.MESSAGES.TOKEN_MISSING} />
          <Link to={ROUTES.FORGOT_PASSWORD} fontWeight="600" color={COLORS.primary.base}>Request a new link</Link>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <Stack gap="5">
            {formError && !Object.keys(errors).length && <InlineAlert status="error" description={formError} />}
            <PasswordInput
              label="New password"
              autoComplete="new-password"
              isVisible={isVisible}
              onToggleVisibility={toggleVisibility}
              value={values.password}
              onChange={(event) => handleChange('password', event.target.value)}
              invalid={Boolean(errors.password)}
              error={errors.password}
            />
            <PasswordInput
              label="Confirm new password"
              autoComplete="new-password"
              isVisible={isVisible}
              onToggleVisibility={toggleVisibility}
              value={values.confirmPassword}
              onChange={(event) => handleChange('confirmPassword', event.target.value)}
              invalid={Boolean(errors.confirmPassword)}
              error={errors.confirmPassword}
            />
            <Button type="submit" tone="primary" size="lg" width="100%" loading={isSubmitting} loadingText="Saving...">
              Reset password
            </Button>
          </Stack>
        </form>
      )}

      <Box mt="8" textAlign="center">
        <Link to={ROUTES.LOGIN} display="inline-flex" alignItems="center" gap="2" fontSize="14px" fontWeight="600" color={COLORS.primary.base}>
          <ArrowLeftIcon size={16} /> Back to sign in
        </Link>
      </Box>
    </AuthSplitLayout>
  );
};
