import { Stack, Flex, Box, Text } from '@/common/components';
import { COLORS } from '@/common/constants';
import { CheckIcon, CloseIcon } from '@/adapters/icons';

const PASSED = 'Passed';
const NOT_VERIFIABLE = 'Not verifiable';

const NotVerifiedList = ({ rules }) => (
  <Box mt="8">
    <Text fontSize="13px" fontWeight="700" letterSpacing="0.06em" textTransform="uppercase" color={COLORS.body.heading}>
      Not verified automatically ({rules.length})
    </Text>
    <Text mt="1" mb="3" fontSize="13px" color={COLORS.body.muted}>
      These rules could not be decided from the document file, so they are not counted in the score. Check them by hand.
    </Text>
    <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
      {rules.map((rule, index) => (
        <Box as="li" key={`${rule.ruleId}-${index}`} px="4" py="2.5" borderRadius="10px" borderWidth="1px" borderColor={COLORS.secondary.subtle}>
          <Text fontSize="14px" fontWeight="500" color={COLORS.body.heading}>
            {rule.ruleName}
            {rule.sourceRef && <Text as="span" fontWeight="400" color={COLORS.body.muted}> · {rule.sourceRef}</Text>}
          </Text>
          {rule.reasoning && <Text fontSize="13px" color={COLORS.body.muted}>{rule.reasoning}</Text>}
        </Box>
      ))}
    </Stack>
  </Box>
);

/** One full-width row per checked rule (green when passed, red when failed), then the rules that could not be checked. */
export const RuleBreakdown = ({ rules }) => {
  const checked = rules.filter((rule) => rule.status !== NOT_VERIFIABLE);
  const notVerified = rules.filter((rule) => rule.status === NOT_VERIFIABLE);
  return (
    <>
      <CheckedList rules={checked} />
      {notVerified.length > 0 && <NotVerifiedList rules={notVerified} />}
    </>
  );
};

const CheckedList = ({ rules }) => (
  <Stack gap="3" as="ul" listStyleType="none" m="0" p="0">
    {rules.map((rule, index) => {
      const passed = rule.status === PASSED;
      const palette = passed ? COLORS.success : COLORS.error;
      const StatusIcon = passed ? CheckIcon : CloseIcon;

      return (
        <Flex
          as="li"
          key={`${rule.ruleId}-${index}`}
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
            <Text fontWeight="500" color={COLORS.body.heading}>
              {rule.ruleName}
              {rule.sourceRef && <Text as="span" fontWeight="400" fontSize="13px" color={COLORS.body.muted}> · {rule.sourceRef}</Text>}
            </Text>
            {rule.reasoning && <Text mt="0.5" fontSize="13px" color={COLORS.body.muted}>{rule.reasoning}</Text>}
          </Box>
          <Text fontSize="14px" fontWeight="600" color={palette.base} flexShrink={0}>{rule.status}</Text>
        </Flex>
      );
    })}
  </Stack>
);
