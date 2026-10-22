import { Stack } from '@chakra-ui/react';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { Text } from './Typography';
import { COLORS } from '@/common/constants';
import { EmptyIcon, ErrorIcon, SuccessIcon, InfoIcon } from '@/adapters/icons';

/** Centered, no background: icon, title, message and an optional action. The icon is fully caller-supplied. */
export const BaseNotify = ({ icon, title, message, actionLabel, onAction, ...props }) => (
  <Stack align="center" textAlign="center" gap="3" py="8" {...props}>
    {icon}
    {title && <Text fontWeight="600" color={COLORS.body.heading}>{title}</Text>}
    {message && <Text color={COLORS.body.muted}>{message}</Text>}
    {actionLabel && onAction && <Button tone="primary" onClick={onAction}>{actionLabel}</Button>}
  </Stack>
);

// state: 'empty' | 'error' | 'success' | 'info'. Picks the icon and its color; not customizable.
const STATES = {
  empty: { Icon: EmptyIcon, color: COLORS.secondary.base },
  error: { Icon: ErrorIcon, color: COLORS.error.base },
  success: { Icon: SuccessIcon, color: COLORS.success.base },
  info: { Icon: InfoIcon, color: COLORS.info.base },
};

export const StatusNotify = ({ state = 'empty', ...props }) => {
  const { Icon, color } = STATES[state];
  return <BaseNotify icon={<Icon size={36} color={color} />} {...props} />;
};

export const LoadingNotify = ({ spinnerProps, ...props }) => (
  <BaseNotify icon={<Spinner size="lg" {...spinnerProps} />} {...props} />
);
