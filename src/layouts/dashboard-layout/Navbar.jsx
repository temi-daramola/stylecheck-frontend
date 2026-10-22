import { Flex, Box, Text, Link, IconButton, Avatar, HStack } from '@/common/components';
import { COLORS, ROUTES } from '@/common/constants';
import { BrandIcon, SettingsIcon, LogOutIcon, ArrowLeftIcon } from '@/adapters/icons';
import { useNavigation, useRouteLocation } from '@/adapters/router';
import { useAuth } from '@/application';

const FIRST_NAME_PARTS = 2;

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { goTo } = useNavigation();
  const { path } = useRouteLocation();
  const isDashboard = path === ROUTES.DASHBOARD;
  const isSettings = path === ROUTES.SETTINGS;

  const handleLogout = async () => {
    await logout();
    goTo(ROUTES.LOGIN);
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      height="68px"
      px={{ base: '4', md: '8' }}
      bg={COLORS.navy.dark}
      color={COLORS.stage.base}
      position="sticky"
      top="0"
      zIndex="20"
    >
      <HStack gap="5">
        {!isDashboard && (
          <Link to={ROUTES.DASHBOARD} display="flex" alignItems="center" gap="2" color={COLORS.secondary.subtle} fontSize="14px" _hover={{ color: COLORS.stage.base, textDecoration: 'none' }}>
            <ArrowLeftIcon size={16} />
            Dashboard
          </Link>
        )}
        <Link to={ROUTES.DASHBOARD} display="flex" alignItems="center" gap="2.5" color={COLORS.stage.base} _hover={{ textDecoration: 'none' }}>
          <Flex align="center" justify="center" boxSize="34px" borderRadius="9px" bg={COLORS.primary.base}>
            <BrandIcon size={20} />
          </Flex>
          <Text fontSize="19px" fontWeight="700" letterSpacing="-0.02em">StyleCheck</Text>
        </Link>
      </HStack>

      <HStack gap="3">
        {!isSettings && (
          <IconButton label="Settings" icon={<SettingsIcon size={20} />} onClick={() => goTo(ROUTES.SETTINGS)} color={COLORS.secondary.subtle} _hover={{ bg: COLORS.navy.base, color: COLORS.stage.base }} />
        )}
        <HStack gap="2.5">
          <Avatar name={user?.name} size="sm" />
          <Box display={{ base: 'none', md: 'block' }}>
            <Text fontSize="14px" fontWeight="500">{user?.name?.split(' ').slice(0, FIRST_NAME_PARTS).join(' ')}</Text>
          </Box>
        </HStack>
        <IconButton label="Sign out" icon={<LogOutIcon size={18} />} onClick={handleLogout} color={COLORS.secondary.subtle} _hover={{ bg: COLORS.navy.base, color: COLORS.stage.base }} />
      </HStack>
    </Flex>
  );
};
