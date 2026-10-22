import { Spinner as ChakraSpinner } from '@chakra-ui/react';
import { COLORS } from '@/common/constants';

// size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'. tone: our own prop, not colorPalette.
export const Spinner = ({ tone = 'primary', ...props }) => <ChakraSpinner color={COLORS[tone].base} {...props} />;
