import { Flex, Box, Text, Heading, HStack } from '@/common/components';
import { COLORS } from '@/common/constants';
import { BrandIcon, SparklesIcon } from '@/adapters/icons';
import { AuthConstants } from '@/modules/auth/constants/AuthConstants.js';

const { HERO } = AuthConstants;

/** Split screen shared by login, forgot-password and reset-password: brand panel left, form right. */
export const AuthSplitLayout = ({ children }) => (
  <Flex minHeight="100vh" width="100%">
    <Flex
      display={{ base: 'none', lg: 'flex' }}
      flex="1.1"
      direction="column"
      justify="space-between"
      bg={COLORS.navy.base}
      color={COLORS.stage.base}
      px="16"
      py="14"
    >
      <HStack gap="3">
        <Flex align="center" justify="center" boxSize="40px" borderRadius="11px" bg={COLORS.primary.base}>
          <BrandIcon size={24} />
        </Flex>
        <Text fontSize="22px" fontWeight="700" letterSpacing="-0.02em">StyleCheck</Text>
      </HStack>

      <Box maxW="520px">
        <HStack
          display="inline-flex"
          gap="2"
          px="3.5"
          py="1.5"
          mb="7"
          borderRadius="full"
          borderWidth="1px"
          borderColor={COLORS.primary.base}
          bg={COLORS.navy.dark}
          color={COLORS.primary.subtle}
          fontSize="13px"
          fontWeight="600"
        >
          <SparklesIcon size={15} />
          <Text as="span">{HERO.BADGE}</Text>
        </HStack>
        <Heading as="h1" fontSize="44px" fontWeight="800" lineHeight="1.15" letterSpacing="-0.03em" mb="5" color={COLORS.stage.base}>
          {HERO.TITLE}
        </Heading>
        <Text fontSize="17px" lineHeight="1.6" color={COLORS.secondary.subtle}>{HERO.SUBTITLE}</Text>
      </Box>

      <HStack gap="14" pt="8" borderTopWidth="1px" borderColor={COLORS.navy.dark}>
        {HERO.STATS.map((stat) => (
          <Box key={stat.label}>
            <Text fontSize="30px" fontWeight="800">{stat.value}</Text>
            <Text fontSize="13px" color={COLORS.secondary.subtle}>{stat.label}</Text>
          </Box>
        ))}
      </HStack>
    </Flex>

    <Flex flex="1" align="center" justify="center" bg={COLORS.stage.base} px="8" py="12">
      <Box width="100%" maxW="420px">{children}</Box>
    </Flex>
  </Flex>
);
