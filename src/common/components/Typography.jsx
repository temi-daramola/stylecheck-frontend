import { Text as ChakraText, Heading as ChakraHeading, Link as ChakraLink } from '@chakra-ui/react';
import { Link as RouterLink } from '@/adapters/router';

export const Text = (props) => <ChakraText {...props} />;
export const Heading = (props) => <ChakraHeading {...props} />;

/** In-app navigation when `to` is given, a plain anchor otherwise. */
export const Link = ({ to, children, ...props }) =>
  to ? (
    <ChakraLink asChild {...props}>
      <RouterLink to={to}>{children}</RouterLink>
    </ChakraLink>
  ) : (
    <ChakraLink {...props}>{children}</ChakraLink>
  );
