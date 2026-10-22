import { Flex, Box, Text, HStack, Avatar, Button } from '@/common/components';
import { COLORS } from '@/common/constants';
import { InviteIcon, DeactivateUserIcon, ActivateUserIcon } from '@/adapters/icons';
import { formatLongDate } from '@/common/utils';

const Badge = ({ children, tone }) => (
  <Text as="span" fontSize="12px" fontWeight="700" px="2.5" py="0.5" borderRadius="full" bg={COLORS[tone].subtle} color={COLORS[tone].base}>
    {children}
  </Text>
);

/** One account: who they are, their state, and the actions an admin can take. Own account has no actions. */
export const SupervisorRow = ({ supervisor, isSelf, isInviting, isUpdating, onInvite, onDeactivate, onReactivate }) => (
  <Flex as="li" align="center" gap="4" wrap="wrap" px="5" py="4" borderTopWidth="1px" borderColor={COLORS.secondary.subtle} opacity={supervisor.isActive ? 1 : 0.7}>
    <Avatar name={supervisor.name} subtle />
    <Box flex="1" minWidth="200px">
      <HStack gap="2" wrap="wrap">
        <Text fontWeight="600" color={COLORS.body.heading}>{supervisor.name}</Text>
        {supervisor.role === 'admin' && <Badge tone="primary">Admin</Badge>}
        {!supervisor.isActive && <Badge tone="error">Deactivated</Badge>}
        {isSelf && <Badge tone="secondary">You</Badge>}
      </HStack>
      <Text fontSize="14px" color={COLORS.body.muted} truncate>{supervisor.email} · added {formatLongDate(supervisor.createdAt)}</Text>
    </Box>

    {!isSelf && (
      <HStack gap="2">
        {supervisor.isActive && (
          <Button size="sm" variant="outline" tone="primary" onClick={() => onInvite(supervisor)} loading={isInviting} loadingText="Sending...">
            <InviteIcon size={16} /> Resend invite
          </Button>
        )}
        {supervisor.isActive ? (
          <Button size="sm" variant="outline" tone="error" onClick={() => onDeactivate(supervisor)} disabled={isUpdating}>
            <DeactivateUserIcon size={16} /> Deactivate
          </Button>
        ) : (
          <Button size="sm" variant="outline" tone="success" onClick={() => onReactivate(supervisor)} loading={isUpdating}>
            <ActivateUserIcon size={16} /> Reactivate
          </Button>
        )}
      </HStack>
    )}
  </Flex>
);
