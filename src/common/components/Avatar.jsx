import { Avatar as ChakraAvatar } from '@chakra-ui/react';
import { COLORS } from '@/common/constants';

// size: 'xs' | 'sm' | 'md' | 'lg'. `subtle` renders a light chip with dark initials (used in lists).
export const Avatar = ({ name, tone = 'primary', subtle = false, ...props }) => (
  <ChakraAvatar.Root {...props}>
    <ChakraAvatar.Fallback
      name={name}
      bg={subtle ? COLORS[tone].subtle : COLORS[tone].base}
      color={subtle ? COLORS[tone].base : COLORS.stage.base}
      fontWeight="700"
    />
  </ChakraAvatar.Root>
);
