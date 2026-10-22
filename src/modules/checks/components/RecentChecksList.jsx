import { Stack, Flex, Box, Text, Link, Avatar, StatusNotify } from '@/common/components';
import { COLORS, ROUTES } from '@/common/constants';
import { formatRelativeDate } from '@/common/utils';
import { getScoreTone, getBandTone } from '@/modules/checks/utils/ScoreStyles.js';

/**
 * Recent checks. `showScore` (the supervisor's preference) swaps the numeric score for the band label,
 * so the row always conveys the outcome, in the same compliance color.
 */
export const RecentChecksList = ({ checks, showScore }) => {
  if (checks.length === 0) {
    return (
      <StatusNotify state="empty" title="No checks yet" message="Run your first compliance check above and it will appear here." />
    );
  }

  return (
    <Stack gap="3" as="ul" listStyleType="none" m="0" p="0">
      {checks.map((check) => {
        const tone = COLORS[showScore ? getScoreTone(check.complianceScore) : getBandTone(check.complianceBand)].base;
        return (
          <Flex as="li" key={check.id} align="center" gap="4" px="5" py="4" bg={COLORS.stage.base} borderRadius="14px" borderWidth="1px" borderColor={COLORS.secondary.subtle}>
            <Avatar name={check.studentName} subtle size="md" />
            <Box flex="1" minWidth="0">
              <Text fontWeight="600" color={COLORS.body.heading} truncate>{check.studentName}</Text>
              <Text fontSize="14px" color={COLORS.body.muted}>{check.chapterSection}</Text>
            </Box>
            <Text fontWeight="700" color={tone} flexShrink={0}>
              {showScore ? `${check.complianceScore}/100` : check.complianceBand}
            </Text>
            <Text display={{ base: 'none', md: 'block' }} fontSize="14px" color={COLORS.body.muted} minWidth="120px" textAlign="right">
              {formatRelativeDate(check.checkDate)}
            </Text>
            <Link to={ROUTES.results(check.id)} fontWeight="600" fontSize="14px" color={COLORS.primary.base}>View</Link>
          </Flex>
        );
      })}
    </Stack>
  );
};
