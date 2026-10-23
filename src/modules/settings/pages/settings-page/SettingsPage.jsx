import { Stack, Box, Heading, Text, Button, Card, Flex, Switch, InlineAlert, DataGate, FileDropZone, ContentBlockerOverlay, PageLoadingIndicator } from '@/common/components';
import { COLORS, FILE_LIMITS } from '@/common/constants';
import { MANUAL_STATE } from '@/common/utils';
import { UploadIcon, RefreshIcon } from '@/adapters/icons';
import { ManualFileCard } from '@/modules/settings/components/ManualFileCard.jsx';
import { useSettingsPageController } from '@/modules/settings/controllers/settings-page/useSettingsPageController.js';
import { SettingsConstants } from '@/modules/settings/constants/SettingsConstants.js';

const SectionHeader = ({ title, description }) => (
  <Box px="6" py="5" borderBottomWidth="1px" borderColor={COLORS.secondary.subtle}>
    <Heading as="h2" fontSize="17px" fontWeight="700" color={COLORS.body.heading}>{title}</Heading>
    {description && <Text mt="1" fontSize="14px" color={COLORS.body.muted}>{description}</Text>}
  </Box>
);

export const SettingsPage = () => {
  const {
    manual, manualState, manualQuery, file, isExtracting, selectionError, canSubmit, isUploading, isProcessing,
    uploadError, processError, banner, selectFile, clearFile, submit, processSaved, rulesList, preferences,
  } = useSettingsPageController();

  const hasManual = manualState !== MANUAL_STATE.NONE;
  const isBusy = isUploading || isProcessing;

  return (
    <Stack gap="8" maxW="860px" mx="auto">
      <Box>
        <Heading as="h1" fontSize="32px" fontWeight="800" letterSpacing="-0.02em" color={COLORS.body.heading}>Settings</Heading>
        <Text mt="1" color={COLORS.body.muted}>Manage your style manual and application preferences.</Text>
      </Box>

      <Card>
        <SectionHeader title="Style Manual" description="The style manual is used as the reference for all compliance checks." />
        <Box p="6">
          <DataGate {...manualQuery} errorTitle="Couldn't load your style manual" onRetry={manualQuery.retry} skeletonType="card">
            <ContentBlockerOverlay isActive={isBusy}>
              <Stack gap="5">
                {hasManual && (
                  <ManualFileCard
                    manual={manual}
                    state={manualState}
                    isRulesOpen={rulesList.isOpen}
                    onToggleRules={rulesList.toggle}
                    onProcess={processSaved}
                    isProcessing={isProcessing}
                    processError={processError}
                  />
                )}

                <Box>
                  <Text fontSize="12px" fontWeight="700" letterSpacing="0.06em" textTransform="uppercase" color={COLORS.body.heading} mb="3">
                    {hasManual ? 'Replace style manual' : 'Upload your style manual'}
                  </Text>
                  <FileDropZone
                    file={file}
                    onFileSelected={selectFile}
                    onClear={clearFile}
                    accept=".pdf,.docx"
                    title={hasManual ? 'Drag & drop a new file' : 'Drag & drop your style manual'}
                    helper="or"
                    badge={`PDF or DOCX · Max ${FILE_LIMITS.MANUAL_MAX_MB}MB`}
                    disabled={isBusy || isExtracting}
                    compact
                  />
                  <Text mt="2" fontSize="13px" color={COLORS.body.muted}>
                    The text is read in your browser. The file itself is never uploaded; only its text is saved.
                  </Text>
                </Box>

                {isExtracting && <InlineAlert status="info" description="Reading the file..." />}
                {selectionError && <InlineAlert status="error" description={selectionError} />}
                {uploadError && <InlineAlert status="error" title="Upload problem" description={uploadError} />}
                {banner && <InlineAlert status="success" description={banner} />}

                <Box>
                  <Button tone="primary" size="lg" disabled={!canSubmit} loading={isUploading} loadingText="Saving and reading every rule (about a minute)..." onClick={submit}>
                    {hasManual ? <RefreshIcon size={18} /> : <UploadIcon size={18} />}
                    {hasManual ? 'Replace Style Manual' : 'Upload Style Manual'}
                  </Button>
                </Box>
              </Stack>
            </ContentBlockerOverlay>
          </DataGate>
        </Box>
      </Card>

      <Card>
        <SectionHeader title="Preferences" />
        <DataGate isLoading={preferences.isLoading} isError={preferences.isError} error={preferences.error} onRetry={preferences.retry} skeletonType="form">
          <Stack gap="0" px="6">
            {SettingsConstants.PREFERENCES.map(({ key, label }) => (
              <Flex key={key} align="center" justify="space-between" py="5" borderTopWidth={key === SettingsConstants.PREFERENCES[0].key ? '0' : '1px'} borderColor={COLORS.secondary.subtle}>
                <Text color={COLORS.body.heading}>{label}</Text>
                <Switch
                  checked={Boolean(preferences.preferences?.[key])}
                  onChange={(next) => preferences.setPreference(key, next)}
                  disabled={preferences.isSaving}
                  aria-label={label}
                />
              </Flex>
            ))}
          </Stack>
        </DataGate>
      </Card>

      <PageLoadingIndicator isLoading={isBusy} message="Extracting style rules, this can take a little while..." />
    </Stack>
  );
};
