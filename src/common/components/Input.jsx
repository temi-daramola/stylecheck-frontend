import { Field, Input as ChakraInput, Box } from '@chakra-ui/react';
import { COLORS } from '@/common/constants';

const ELEMENT_WIDTH = '44px';

/**
 * label/error/invalid come from the caller (typically `useForm`). `startElement` and `endElement`
 * place an icon or control inside the field; they are optional.
 */
export const Input = ({ label, error, invalid = false, startElement, endElement, ...props }) => (
  <Field.Root invalid={invalid}>
    {label && (
      <Field.Label fontSize="12px" fontWeight="600" letterSpacing="0.04em" textTransform="uppercase" color={COLORS.body.heading}>
        {label}
      </Field.Label>
    )}
    <Box position="relative" width="100%">
      {startElement && (
        <Box position="absolute" insetY="0" left="0" width={ELEMENT_WIDTH} display="flex" alignItems="center" justifyContent="center" color={COLORS.body.muted} pointerEvents="none" zIndex="1">
          {startElement}
        </Box>
      )}
      <ChakraInput
        size="lg"
        bg={COLORS.stage.surface}
        borderColor={invalid ? COLORS.error.base : COLORS.secondary.subtle}
        borderRadius="10px"
        color={COLORS.body.base}
        _focusVisible={{ borderColor: COLORS.primary.base, boxShadow: 'none', outline: 'none' }}
        ps={startElement ? ELEMENT_WIDTH : undefined}
        pe={endElement ? ELEMENT_WIDTH : undefined}
        {...props}
      />
      {endElement && (
        <Box position="absolute" insetY="0" right="0" width={ELEMENT_WIDTH} display="flex" alignItems="center" justifyContent="center" zIndex="1">
          {endElement}
        </Box>
      )}
    </Box>
    {invalid && error && <Field.ErrorText color={COLORS.error.base}>{error}</Field.ErrorText>}
  </Field.Root>
);
