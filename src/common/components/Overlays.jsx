import { Box, HStack } from '@chakra-ui/react';
import { COLORS } from '@/common/constants';
import { Spinner } from './Spinner';
import { Text } from './Typography';

/** Visible but not usable. Knows nothing about *why* it is active, only that it is. */
export const BlurOverlay = ({ active, children }) => (
  <Box
    filter={active ? 'blur(4px)' : 'none'}
    pointerEvents={active ? 'none' : 'auto'}
    userSelect={active ? 'none' : 'auto'}
    transition="filter 0.15s ease"
    aria-hidden={active}
  >
    {children}
  </Box>
);

/** Layers a translucent blocker over its children while `isActive`. Genuinely blocks interaction. */
export const ContentBlockerOverlay = ({ isActive = false, children }) => (
  <Box position="relative">
    {children}
    {isActive && (
      <Box position="absolute" inset="0" zIndex="10" bg={COLORS.overlay.light} backdropFilter="blur(2px)" pointerEvents="auto" aria-hidden="true" />
    )}
  </Box>
);

/** Small click-through pill fixed to the top of the viewport for a background operation. */
export const PageLoadingIndicator = ({ isLoading = false, message = 'Saving changes...' }) => {
  if (!isLoading) return null;
  return (
    <Box pointerEvents="none" position="fixed" insetX="0" top="0" zIndex="1400" display="flex" justifyContent="center" px="4">
      <HStack mt="4" gap="2" bg={COLORS.navy.dark} color={COLORS.stage.base} px="4" py="2" rounded="full" boxShadow={`0 6px 20px ${COLORS.shadow.strong}`}>
        <Spinner size="sm" tone="info" />
        <Text fontSize="sm">{message}</Text>
      </HStack>
    </Box>
  );
};
