import { Stack, Flex, Box, Heading, Text, Button, Card, Input, Textarea, InlineAlert, DataGate, Link } from '@/common/components';
import { COLORS } from '@/common/constants';
import { SendIcon, DocumentIcon, MailIcon, ArrowLeftIcon } from '@/adapters/icons';
import { formatLongDate } from '@/common/utils';
import { useSharePageController } from '@/modules/checks/controllers/share-page/useSharePageController.js';
import { ChecksConstants } from '@/modules/checks/constants/ChecksConstants.js';
import { ROUTES } from '@/common/constants';

export const SharePage = () => {
  const { check, isLoading, isError, error, retry, form, checkId } = useSharePageController();
  const { values, errors, formError, isSubmitting, handleChange, handleSubmit, isSent } = form;

  return (
    <Box maxW="560px" mx="auto">
      <DataGate isLoading={isLoading} isError={isError} error={error} onRetry={retry} errorTitle="Couldn't load this report" skeletonType="card">
        {check && (
          <Card p={{ base: '6', md: '10' }}>
            <Stack gap="6" align="stretch">
              <Stack align="center" gap="3" textAlign="center">
                <Flex align="center" justify="center" boxSize="64px" borderRadius="full" bg={COLORS.stage.surface} color={COLORS.body.heading}>
                  <SendIcon size={28} />
                </Flex>
                <Heading as="h1" fontSize="28px" fontWeight="800" letterSpacing="-0.02em" color={COLORS.body.heading}>Share Report with Student</Heading>
                <Text color={COLORS.body.muted}>Send the compliance report directly to your student's email.</Text>
              </Stack>

              <Flex align="center" gap="4" p="4" borderRadius="14px" borderWidth="1px" borderColor={COLORS.secondary.subtle} bg={COLORS.stage.surface}>
                <Flex align="center" justify="center" boxSize="44px" borderRadius="10px" bg={COLORS.primary.subtle} color={COLORS.primary.base} flexShrink={0}>
                  <DocumentIcon size={22} />
                </Flex>
                <Box flex="1" minWidth="0">
                  <Text fontWeight="600" color={COLORS.body.heading} truncate>Compliance Report — {check.studentName}</Text>
                  <Text fontSize="13px" color={COLORS.body.muted}>
                    {check.chapterSection} · Score: {check.complianceScore}/100 · {formatLongDate(check.checkDate)}
                  </Text>
                </Box>
                <Text fontSize="12px" fontWeight="700" color={COLORS.error.base} bg={COLORS.error.subtle} px="2.5" py="1" borderRadius="6px">PDF</Text>
              </Flex>

              <form onSubmit={handleSubmit} noValidate>
                <Stack gap="5">
                  <Input
                    label="Student email"
                    type="email"
                    placeholder="student@university.edu"
                    startElement={<MailIcon size={18} />}
                    value={values.studentEmail}
                    onChange={(event) => handleChange('studentEmail', event.target.value)}
                    invalid={Boolean(errors.studentEmail)}
                    error={errors.studentEmail}
                  />
                  <Textarea
                    label="Additional message (optional)"
                    rows={4}
                    placeholder={ChecksConstants.SHARE_MESSAGE_PLACEHOLDER}
                    value={values.message}
                    onChange={(event) => handleChange('message', event.target.value)}
                    invalid={Boolean(errors.message)}
                    error={errors.message}
                  />

                  {formError && !Object.keys(errors).length && <InlineAlert status="error" title="Report not sent" description={formError} />}
                  {isSent && <InlineAlert status="success" description={ChecksConstants.MESSAGES.SHARE_SUCCESS_BANNER} />}

                  <Button type="submit" tone="primary" size="lg" loading={isSubmitting} loadingText="Sending...">
                    <SendIcon size={18} /> {isSent ? 'Send again' : 'Send Report'}
                  </Button>
                </Stack>
              </form>

              <Box textAlign="center">
                <Link to={ROUTES.results(checkId)} display="inline-flex" alignItems="center" gap="2" fontSize="14px" fontWeight="600" color={COLORS.primary.base}>
                  <ArrowLeftIcon size={16} /> Back to Results
                </Link>
              </Box>
            </Stack>
          </Card>
        )}
      </DataGate>
    </Box>
  );
};
