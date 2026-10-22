import { Field, Textarea as ChakraTextarea } from '@chakra-ui/react';
import { COLORS } from '@/common/constants';

export const Textarea = ({ label, error, invalid = false, ...props }) => (
  <Field.Root invalid={invalid}>
    {label && (
      <Field.Label fontSize="12px" fontWeight="600" letterSpacing="0.04em" textTransform="uppercase" color={COLORS.body.heading}>
        {label}
      </Field.Label>
    )}
    <ChakraTextarea
      bg={COLORS.stage.surface}
      borderColor={invalid ? COLORS.error.base : COLORS.secondary.subtle}
      borderRadius="10px"
      color={COLORS.body.base}
      _focusVisible={{ borderColor: COLORS.primary.base, boxShadow: 'none', outline: 'none' }}
      {...props}
    />
    {invalid && error && <Field.ErrorText color={COLORS.error.base}>{error}</Field.ErrorText>}
  </Field.Root>
);
