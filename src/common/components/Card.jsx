import { Box } from '@chakra-ui/react';
import { COLORS } from '@/common/constants';

export const Card = ({ children, ...props }) => (
  <Box
    bg={COLORS.stage.base}
    borderRadius="16px"
    borderWidth="1px"
    borderColor={COLORS.secondary.subtle}
    boxShadow={`0 1px 3px ${COLORS.shadow.soft}`}
    {...props}
  >
    {children}
  </Box>
);
