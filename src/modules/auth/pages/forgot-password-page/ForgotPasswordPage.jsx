import { Stack, Box, Heading, Text, Button, Input, InlineAlert, Link } from '@/common/components';
import { COLORS, ROUTES } from '@/common/constants';
import { MailIcon, ArrowLeftIcon } from '@/adapters/icons';
import { AuthSplitLayout } from '@/modules/auth/components/AuthSplitLayout.jsx';
import { useForgotPasswordPageController } from '@/modules/auth/controllers/forgot-password-page/useForgotPasswordPageController.js';

export const ForgotPasswordPage = () => {
  const { values, errors, formError, isSubmitting, handleChange, handleSubmit, sentTo } = useForgotPasswordPageController();

  return (
    <AuthSplitLayout>
      <Box mb="8">
        <Heading as="h2" fontSize="28px" fontWeight="800" letterSpacing="-0.02em" color={COLORS.body.heading} mb="2">
          Reset your password
        </Heading>
        <Text color={COLORS.body.muted}>Enter your email and we will send you a link to choose a new password.</Text>
      </Box>

      {sentTo ? (
        <InlineAlert
          status="success"
          title="Check your inbox"
          description={`If ${sentTo} is registered, a reset link is on its way. It expires in 60 minutes.`}
        />
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <Stack gap="5">
            {formError && !Object.keys(errors).length && <InlineAlert status="error" description={formError} />}
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@university.edu"
              startElement={<MailIcon size={18} />}
              value={values.email}
              onChange={(event) => handleChange('email', event.target.value)}
              invalid={Boolean(errors.email)}
              error={errors.email}
            />
            <Button type="submit" tone="primary" size="lg" width="100%" loading={isSubmitting} loadingText="Sending...">
              Send reset link
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
