import { Stack, Box, Heading, Text, Button, Input, InlineAlert, Link } from '@/common/components';
import { COLORS, ROUTES } from '@/common/constants';
import { MailIcon, ArrowRightIcon } from '@/adapters/icons';
import { AuthSplitLayout } from '@/modules/auth/components/AuthSplitLayout.jsx';
import { PasswordInput } from '@/modules/auth/components/PasswordInput.jsx';
import { useLoginPageController } from '@/modules/auth/controllers/login-page/useLoginPageController.js';

export const LoginPage = () => {
  const { values, errors, formError, isSubmitting, handleChange, handleSubmit, isVisible, toggleVisibility, notice, noticeStatus } =
    useLoginPageController();

  return (
    <AuthSplitLayout>
      <Box mb="8">
        <Heading as="h2" fontSize="28px" fontWeight="800" letterSpacing="-0.02em" color={COLORS.body.heading} mb="2">
          Welcome back
        </Heading>
        <Text color={COLORS.body.muted}>Sign in to check student documents against your style manual.</Text>
      </Box>

      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="5">
          {notice && <InlineAlert status={noticeStatus} description={notice} />}
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

          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            isVisible={isVisible}
            onToggleVisibility={toggleVisibility}
            value={values.password}
            onChange={(event) => handleChange('password', event.target.value)}
            invalid={Boolean(errors.password)}
            error={errors.password}
          />

          <Box textAlign="right" mt="-2">
            <Link to={ROUTES.FORGOT_PASSWORD} fontSize="14px" fontWeight="600" color={COLORS.primary.base}>
              Forgot password?
            </Link>
          </Box>

          <Button type="submit" tone="primary" size="lg" width="100%" loading={isSubmitting} loadingText="Signing in...">
            Sign In <ArrowRightIcon size={18} />
          </Button>
        </Stack>
      </form>

      <Text mt="8" textAlign="center" fontSize="14px" color={COLORS.body.muted}>
        Need access? Contact your administrator.
      </Text>
    </AuthSplitLayout>
  );
};
