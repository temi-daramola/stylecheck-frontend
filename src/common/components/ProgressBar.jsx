import { Progress } from '@chakra-ui/react';
import { COLORS } from '@/common/constants';

/** `value` is 0-100. */
export const ProgressBar = ({ value, tone = 'primary', ...props }) => (
  <Progress.Root value={value} {...props}>
    <Progress.Track bg={COLORS.secondary.subtle} borderRadius="full">
      <Progress.Range bg={COLORS[tone].base} />
    </Progress.Track>
  </Progress.Root>
);
