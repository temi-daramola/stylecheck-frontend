import { Stack, Box, Heading, Text, Button, Card, Flex, Switch, InlineAlert, DataGate, FileDropZone, ContentBlockerOverlay, PageLoadingIndicator } from '@/common/components';
import { COLORS, FILE_LIMITS } from '@/common/constants';
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
    manual, manualState, file, isExtracting, selectionError, canSubmit, isUploading, uploadError, justUploaded,
    selectFile, clearFile, submit, rulesList, preferences,
  } = useSettingsPageController();

  const hasManual = Boolean(manual);

  return (
    <Stack gap="8" maxW="860px" mx="auto">
      <Box>
        <Heading as="h1" fontSize="32px" fontWeight="800" letterSpacing="-0.02em" color={COLORS.body.heading}>Settings</Heading>
        <Text mt="1" color={COLORS.body.muted}>Manage your style manual and application preferences.</Text>
      </Box>

      <Card>
        <SectionHeader title="Style Manual" description="The style manual is used as the reference for all compliance checks." />
        <Box p="6">
          <DataGate {...manualState} errorTitle="Couldn't load your style manual" onRetry={manualState.retry} skeletonType="card">
            <ContentBlockerOverlay isActive={isUploading}>
              <Stack gap="5">
                {hasManual && <ManualFileCard manual={manual} isRulesOpen={rulesList.isOpen} onToggleRules={rulesList.toggle} />}

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
                    helper={`or`}
                    badge={`PDF or DOCX · Max ${FILE_LIMITS.MANUAL_MAX_MB}MB`}
                    disabled={isUploading || isExtracting}
                    compact
                  />
                  <Text mt="2" fontSize="13px" color={COLORS.body.muted}>
                    The text is read in your browser. The file itself is not uploaded or stored.
                  </Text>
                </Box>

                {isExtracting && <InlineAlert status="info" description="Reading the file..." />}
                {selectionError && <InlineAlert status="error" description={selectionError} />}
                {uploadError && <InlineAlert status="error" title="Upload failed" description={uploadError} />}
                {justUploaded && <InlineAlert status="success" description={SettingsConstants.MESSAGES.UPLOAD_SUCCESS_BANNER} />}

                <Box>
                  <Button tone="primary" size="lg" disabled={!canSubmit} loading={isUploading} loadingText="Analysing style manual..." onClick={submit}>
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

      <PageLoadingIndicator isLoading={isUploading} message="Extracting rules from your style manual..." />
    </Stack>
  );
};
