import { Flex, Button, Text } from '@/common/components';
import { COLORS } from '@/common/constants';
import { BrandIcon } from '@/adapters/icons';

/** Full-screen state while the session is being checked. Shows a retry when the check itself failed. */
export const AuthLoadingLayout = ({ error, onRetry }) => (
  <Flex direction="column" align="center" justify="center" minHeight="100vh" gap="4" bg={COLORS.navy.base} color={COLORS.stage.base} px="6" textAlign="center">
    <Flex align="center" justify="center" boxSize="52px" borderRadius="14px" bg={COLORS.primary.base}>
      <BrandIcon size={28} />
    </Flex>
    {error ? (
      <>
        <Text maxW="360px">{error}</Text>
        <Button tone="primary" onClick={onRetry}>Try again</Button>
      </>
    ) : (
      <Text color={COLORS.secondary.subtle}>Checking your session...</Text>
    )}
  </Flex>
);
