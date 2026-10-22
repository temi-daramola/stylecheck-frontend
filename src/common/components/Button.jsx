import { Button as ChakraButton, IconButton as ChakraIconButton } from '@chakra-ui/react';
import { COLORS } from '@/common/constants';

// tone: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'. Our own prop, not Chakra's colorPalette.
// variant: 'solid' | 'subtle' | 'outline' | 'ghost'
const toneStyles = (tone, variant) => {
  if (!tone) return {};
  const palette = COLORS[tone];
  switch (variant) {
    case 'outline':
      return { color: palette.base, borderColor: palette.base, bg: COLORS.stage.base, _hover: { bg: palette.subtle } };
    case 'ghost':
      return { color: palette.base, _hover: { bg: palette.subtle } };
    case 'subtle':
      return { bg: palette.subtle, color: palette.base, _hover: { bg: palette.subtle, color: palette.hover } };
    default:
      return { bg: palette.base, color: COLORS.stage.base, _hover: { bg: palette.hover } };
  }
};

export const Button = ({ children, tone, variant = 'solid', ...props }) => (
  <ChakraButton variant={variant} fontWeight="600" {...toneStyles(tone, variant)} {...props}>
    {children}
  </ChakraButton>
);

export const IconButton = ({ icon, label, tone, variant = 'ghost', ...props }) => (
  <ChakraIconButton aria-label={label} variant={variant} {...toneStyles(tone, variant)} {...props}>
    {icon}
  </ChakraIconButton>
);
