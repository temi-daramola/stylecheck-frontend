import { Stack, Box, Heading, Text, Button, Card, InlineAlert, DataGate } from '@/common/components';
import { COLORS } from '@/common/constants';
import { CheckUploadCard } from '@/modules/checks/components/CheckUploadCard.jsx';
import { LockedSection } from '@/modules/checks/components/LockedSection.jsx';
import { PendingCheckNotice } from '@/modules/checks/components/PendingCheckNotice.jsx';
import { RecentChecksList } from '@/modules/checks/components/RecentChecksList.jsx';
import { useDashboardPageController } from '@/modules/checks/controllers/dashboard-page/useDashboardPageController.js';
import { ChecksConstants } from '@/modules/checks/constants/ChecksConstants.js';

export const DashboardPage = () => {
  const { userName, greeting, gate, lockPresentation, form, document, upload, pendingCheck, recent, showScore, goToSettings } =
    useDashboardPageController();
  const isLocked = gate.lock !== ChecksConstants.LOCK.NONE;

  return (
    <Stack gap="8">
      <Box>
        <Text color={COLORS.body.muted}>{greeting}</Text>
        <Heading as="h1" fontSize="34px" fontWeight="800" letterSpacing="-0.02em" color={COLORS.body.heading}>{userName}</Heading>
      </Box>

      <DataGate isLoading={gate.isLoading} isError={gate.isError} error={gate.error} onRetry={gate.retry} errorTitle="Couldn't check your style manual" skeletonType="card">
        {isLocked && (
          <InlineAlert
            status="warning"
            title={lockPresentation.bannerTitle}
            description={lockPresentation.bannerText}
            action={<Button tone="warning" onClick={goToSettings}>{lockPresentation.buttonLabel}</Button>}
          />
        )}

        {pendingCheck.pending && !isLocked && (
          <PendingCheckNotice
            pending={pendingCheck.pending}
            isRetrying={pendingCheck.isRetrying}
            onRetry={pendingCheck.retry}
            onDismiss={pendingCheck.dismiss}
          />
        )}

        <LockedSection locked={isLocked} message={lockPresentation?.overlayText}>
          <Card p={{ base: '5', md: '8' }}>
            <CheckUploadCard form={form} document={document} upload={upload} />
          </Card>
        </LockedSection>
      </DataGate>

      <Box>
        <Heading as="h2" fontSize="19px" fontWeight="700" color={COLORS.body.heading} mb="4">Recent Checks</Heading>
        <DataGate isLoading={recent.isLoading} isError={recent.isError} error={recent.error} onRetry={recent.retry} errorTitle="Couldn't load recent checks" skeletonType="list">
          <RecentChecksList checks={recent.checks} showScore={showScore} />
        </DataGate>
      </Box>
    </Stack>
  );
};
