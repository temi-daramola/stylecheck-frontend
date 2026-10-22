import { Outlet } from '@/adapters/router';
import { Box, ErrorBoundary } from '@/common/components';
import { Navbar } from './Navbar.jsx';

export const DashboardLayout = () => (
  <Box minHeight="100vh">
    <Navbar />
    <Box as="main" maxWidth="1020px" mx="auto" px={{ base: '4', md: '6' }} pt="10" pb="20">
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </Box>
  </Box>
);
