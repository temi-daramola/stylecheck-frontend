import { Stack, Flex, Box, Heading, Text, Button, Card, SimpleGrid, DataGate } from '@/common/components';
import { COLORS } from '@/common/constants';
import { DownloadIcon, SendIcon, PlusIcon } from '@/adapters/icons';
import { ScoreGauge } from '@/modules/checks/components/ScoreGauge.jsx';
import { RuleBreakdown } from '@/modules/checks/components/RuleBreakdown.jsx';
import { useResultsPageController } from '@/modules/checks/controllers/results-page/useResultsPageController.js';
import { getBandTone } from '@/modules/checks/utils/ScoreStyles.js';

const StatChip = ({ value, label, color }) => (
  <Box flex="1" textAlign="center" py="3.5" bg={COLORS.stage.base} borderRadius="12px" borderWidth="1px" borderColor={COLORS.secondary.subtle}>
    <Text fontSize="26px" fontWeight="800" lineHeight="1.1" color={color}>{value}</Text>
    <Text fontSize="14px" color={COLORS.body.muted}>{label}</Text>
  </Box>
);

export const ResultsPage = () => {
  const { check, isLoading, isError, error, retry, isDownloading, downloadReport, goToShare, goToDashboard } = useResultsPageController();

  return (
    <DataGate isLoading={isLoading} isError={isError} error={error} onRetry={retry} errorTitle="Couldn't load this report" skeletonType="card">
      {check && (
        <Stack gap="6">
          <Box>
            <Text fontSize="13px" fontWeight="600" letterSpacing="0.05em" textTransform="uppercase" color={COLORS.body.muted}>
              Compliance report · {check.studentName} · {check.chapterSection}
            </Text>
            <Heading as="h1" mt="1" fontSize="32px" fontWeight="800" letterSpacing="-0.02em" color={COLORS.body.heading}>Analysis Complete</Heading>
          </Box>

          <Card overflow="hidden">
            <Flex direction={{ base: 'column', md: 'row' }} align="center" gap="10" p={{ base: '6', md: '10' }} bg={COLORS.stage.surface}>
              <Stack align="center" gap="3" flexShrink={0}>
                <ScoreGauge score={check.complianceScore} />
                <Text fontWeight="700" color={COLORS[getBandTone(check.complianceBand)].base}>{check.complianceBand}</Text>
              </Stack>
              <Box flex="1" width="100%">
                <Heading as="h2" fontSize="22px" fontWeight="700" color={COLORS.body.heading}>Overall Compliance Score</Heading>
                <Text mt="1" mb="5" color={COLORS.body.muted}>
                  {check.rulesFailed} {check.rulesFailed === 1 ? 'rule' : 'rules'} failed out of {check.totalRules} checks. Review the details below.
                </Text>
                <SimpleGrid columns={3} gap="3">
                  <StatChip value={check.rulesPassed} label="Passed" color={COLORS.success.base} />
                  <StatChip value={check.rulesFailed} label="Failed" color={COLORS.error.base} />
                  <StatChip value={check.totalRules} label="Total Rules" color={COLORS.body.heading} />
                </SimpleGrid>
              </Box>
            </Flex>

            <Box p={{ base: '5', md: '8' }}>
              <Text fontSize="13px" fontWeight="700" letterSpacing="0.06em" textTransform="uppercase" color={COLORS.body.heading} mb="4">
                Rule-by-rule breakdown
              </Text>
              <RuleBreakdown rules={check.rules} />
            </Box>

            <Flex gap="3" wrap="wrap" p={{ base: '5', md: '8' }} borderTopWidth="1px" borderColor={COLORS.secondary.subtle}>
              <Button tone="primary" onClick={downloadReport} loading={isDownloading} loadingText="Preparing PDF...">
                <DownloadIcon size={18} /> Download Report
              </Button>
              <Button tone="primary" variant="subtle" onClick={goToShare}>
                <SendIcon size={18} /> Share with Student
              </Button>
              <Button tone="secondary" variant="outline" onClick={goToDashboard} ms={{ md: 'auto' }}>
                <PlusIcon size={18} /> Check Another Document
              </Button>
            </Flex>
          </Card>
        </Stack>
      )}
    </DataGate>
  );
};
