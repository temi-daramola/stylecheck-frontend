import { Box, Flex, Text, BlurOverlay } from '@/common/components';
import { COLORS } from '@/common/constants';
import { LockIcon } from '@/adapters/icons';

/** Covers (never redirects): the section stays visible but blurred, with a padlock and a short reason on top. */
export const LockedSection = ({ locked, message, children }) => (
  <Box position="relative">
    <BlurOverlay active={locked}>{children}</BlurOverlay>
    {locked && (
      <Flex position="absolute" inset="0" zIndex="5" direction="column" align="center" justify="center" gap="3">
        <Flex align="center" justify="center" boxSize="56px" borderRadius="full" bg={COLORS.stage.base} color={COLORS.body.heading} boxShadow={`0 6px 20px ${COLORS.shadow.strong}`}>
          <LockIcon size={24} />
        </Flex>
        <Text fontWeight="600" color={COLORS.body.heading}>{message}</Text>
      </Flex>
    )}
  </Box>
);
