import { Box, Flex } from '@chakra-ui/react';
import { COLORS } from '@/common/constants';
import { SuccessIcon, ErrorIcon, WarningIcon, InfoIcon, CloseIcon } from '@/adapters/icons';

// status: 'info' | 'warning' | 'error' | 'success'. The icon is chosen by status and is not customizable.
const STATUS_ICONS = { success: SuccessIcon, error: ErrorIcon, warning: WarningIcon, info: InfoIcon };

/** Icon beside the text, tinted background, left aligned. `dismissible` is opt-in. */
export const InlineAlert = ({ status = 'info', title, description, action, dismissible = false, onClose, ...props }) => {
  const palette = COLORS[status];
  const StatusIcon = STATUS_ICONS[status];

  return (
    <Flex
      role={status === 'error' ? 'alert' : 'status'}
      align="center"
      gap="3"
      px="4"
      py="3"
      borderRadius="10px"
      borderWidth="1px"
      borderColor={palette.base}
      bg={palette.subtle}
      color={palette.base}
      {...props}
    >
      <Box flexShrink={0} display="flex">
        <StatusIcon size={20} />
      </Box>
      <Box flex="1" minWidth="0">
        {title && <Box fontWeight="600" fontSize="14px">{title}</Box>}
        {description && <Box fontSize="14px" color={COLORS.body.base}>{description}</Box>}
      </Box>
      {action}
      {dismissible && (
        <Box as="button" type="button" aria-label="Dismiss" onClick={onClose} display="flex" cursor="pointer" color={palette.base}>
          <CloseIcon size={16} />
        </Box>
      )}
    </Flex>
  );
};
