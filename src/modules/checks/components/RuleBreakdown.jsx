import { Stack, Flex, Box, Text } from '@/common/components';
import { COLORS } from '@/common/constants';
import { CheckIcon, CloseIcon } from '@/adapters/icons';

const PASSED = 'Passed';

/** One full-width row per rule: green-tinted when passed, red-tinted when failed, with the AI's reasoning. */
export const RuleBreakdown = ({ rules }) => (
  <Stack gap="3" as="ul" listStyleType="none" m="0" p="0">
    {rules.map((rule, index) => {
      const passed = rule.status === PASSED;
      const palette = passed ? COLORS.success : COLORS.error;
      const StatusIcon = passed ? CheckIcon : CloseIcon;

      return (
        <Flex
          as="li"
          key={`${rule.ruleName}-${index}`}
          align="flex-start"
          gap="4"
          px="4"
          py="3.5"
          borderRadius="12px"
          borderWidth="1px"
          borderColor={palette.base}
          bg={palette.subtle}
        >
          <Flex align="center" justify="center" boxSize="28px" mt="0.5" borderRadius="full" bg={palette.base} color={COLORS.stage.base} flexShrink={0}>
            <StatusIcon size={16} />
          </Flex>
          <Box flex="1" minWidth="0">
            <Text fontWeight="500" color={COLORS.body.heading}>{rule.ruleName}</Text>
            {rule.reasoning && <Text mt="0.5" fontSize="13px" color={COLORS.body.muted}>{rule.reasoning}</Text>}
          </Box>
          <Text fontSize="14px" fontWeight="600" color={palette.base} flexShrink={0}>{rule.status}</Text>
        </Flex>
      );
    })}
  </Stack>
);
