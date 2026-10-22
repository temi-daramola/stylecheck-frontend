import { Stack, Flex, Box, Heading, Text, Button, Input, Select, InlineAlert, FileDropZone, ProgressBar, Spinner, SimpleGrid } from '@/common/components';
import { COLORS, FILE_LIMITS } from '@/common/constants';
import { UserIcon, ScanIcon } from '@/adapters/icons';
import { ChecksConstants } from '@/modules/checks/constants/ChecksConstants.js';

const { UPLOAD_PHASE, CHAPTER_ITEMS } = ChecksConstants;

/** The "New Compliance Check" form: file, student name, chapter, and the upload/analysing states. */
export const CheckUploadCard = ({ form, document, upload }) => {
  const { values, errors, formError, isSubmitting, handleChange, handleSubmit } = form;
  const isUploading = upload.phase === UPLOAD_PHASE.UPLOADING;
  const isAnalysing = upload.phase === UPLOAD_PHASE.ANALYSING;
  const locked = isSubmitting || upload.isBusy;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="6">
        <Box>
          <Heading as="h2" fontSize="22px" fontWeight="700" color={COLORS.body.heading}>New Compliance Check</Heading>
          <Text mt="1" color={COLORS.body.muted}>Upload a student document and select the relevant chapter to begin.</Text>
        </Box>

        <Box>
          <FileDropZone
            file={document.file}
            onFileSelected={document.select}
            onClear={document.clear}
            accept={FILE_LIMITS.DOCX_EXTENSION}
            title="Upload Student Document (.docx)"
            helper="Drag & drop your file here, or"
            badge={`DOCX up to ${FILE_LIMITS.STUDENT_DOC_MAX_MB}MB`}
            disabled={locked}
          />
          {document.error && <InlineAlert mt="3" status="error" description={document.error} />}
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="5">
          <Input
            label="Student name"
            placeholder="Enter student full name"
            startElement={<UserIcon size={18} />}
            value={values.studentName}
            onChange={(event) => handleChange('studentName', event.target.value)}
            invalid={Boolean(errors.studentName)}
            error={errors.studentName}
            disabled={locked}
          />
          <Select
            label="Chapter / Section"
            items={CHAPTER_ITEMS}
            value={values.chapterSection}
            onChange={(next) => handleChange('chapterSection', next)}
            disabled={locked}
          />
        </SimpleGrid>

        {formError && !Object.keys(errors).length && <InlineAlert status="error" title="Check failed" description={formError} />}

        <Flex align="center" justify="space-between" gap="4" pt="5" borderTopWidth="1px" borderColor={COLORS.secondary.subtle} wrap="wrap">
          <Text fontSize="14px" color={COLORS.body.muted}>Results are generated instantly using AI analysis</Text>

          {isUploading && (
            <Flex align="center" gap="4" flex="1" minWidth="260px" maxW="420px">
              <Box flex="1">
                <Text fontSize="13px" color={COLORS.body.muted} mb="1.5">Uploading… {upload.progress}%</Text>
                <ProgressBar value={upload.progress} />
              </Box>
              <Button type="button" variant="outline" tone="secondary" onClick={upload.cancel}>Cancel</Button>
            </Flex>
          )}

          {isAnalysing && (
            <Flex align="center" gap="3" color={COLORS.body.heading} fontWeight="600" role="status">
              <Spinner size="sm" /> Analysing document…
            </Flex>
          )}

          {!upload.isBusy && (
            <Button type="submit" tone="primary" size="lg" disabled={isSubmitting}>
              <ScanIcon size={18} /> Check Compliance
            </Button>
          )}
        </Flex>
      </Stack>
    </form>
  );
};
