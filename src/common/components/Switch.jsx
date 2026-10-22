import { Switch as ChakraSwitch, Box } from '@chakra-ui/react';
import { COLORS } from '@/common/constants';

// Renders its own track/thumb: Chakra cannot color its built-in switch from our COLORS without
// registering a theme palette. Root + HiddenInput remain underneath for real accessibility.
const TRACK_SIZES = {
  sm: { width: '36px', height: '20px', thumb: '14px' },
  md: { width: '44px', height: '24px', thumb: '18px' },
};

/** Controlled only: `checked` + `onChange(nextChecked)`. tone: 'primary' | 'success' | ... */
export const Switch = ({ label, checked, onChange, tone = 'primary', size = 'md', ...props }) => {
  const { width, height, thumb } = TRACK_SIZES[size];

  return (
    <ChakraSwitch.Root checked={checked} onCheckedChange={(details) => onChange?.(details.checked)} {...props}>
      <ChakraSwitch.HiddenInput />
      <Box
        width={width}
        height={height}
        borderRadius="full"
        bg={checked ? COLORS[tone].base : COLORS.secondary.subtle}
        display="flex"
        alignItems="center"
        px="3px"
        justifyContent={checked ? 'flex-end' : 'flex-start'}
        transition="background 0.15s"
        cursor={props.disabled ? 'not-allowed' : 'pointer'}
        opacity={props.disabled ? 0.6 : 1}
      >
        <Box width={thumb} height={thumb} borderRadius="full" bg={COLORS.stage.base} boxShadow={`0 1px 2px ${COLORS.shadow.strong}`} />
      </Box>
      {label && <ChakraSwitch.Label>{label}</ChakraSwitch.Label>}
    </ChakraSwitch.Root>
  );
};
