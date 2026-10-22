import { Flex, Box, Text, Button, HStack, InlineAlert } from '@/common/components';
import { COLORS } from '@/common/constants';
import { DocumentIcon, SuccessIcon, WarningIcon, RefreshIcon } from '@/adapters/icons';
import { formatBytes, formatLongDate, MANUAL_STATE } from '@/common/utils';

const StatusBadge = ({ state }) =>
  state === MANUAL_STATE.READY ? (
    <HStack gap="1.5" px="3" py="1" borderRadius="full" bg={COLORS.success.subtle} color={COLORS.success.base} fontSize="13px" fontWeight="600" flexShrink={0}>
      <SuccessIcon size={14} /> Active
    </HStack>
  ) : (
    <HStack gap="1.5" px="3" py="1" borderRadius="full" bg={COLORS.warning.subtle} color={COLORS.warning.base} fontSize="13px" fontWeight="600" flexShrink={0}>
      <WarningIcon size={14} /> Not processed
    </HStack>
  );

/**
 * The saved style manual. `state` is 'ready' (rules available) or 'uploaded' (saved, rules not extracted yet).
 * A ready manual can also have a newer file waiting (`manual.pending`): the current one stays in use until then.
 */
export const ManualFileCard = ({ manual, state, isRulesOpen, onToggleRules, onProcess, isProcessing, processError }) => {
  const isReady = state === MANUAL_STATE.READY;
  const waitingName = isReady ? manual.pending?.fileName : manual.fileName;
  const needsProcessing = !isReady || Boolean(manual.pending);

  return (
    <Box borderRadius="14px" borderWidth="1px" borderColor={COLORS.secondary.subtle} bg={COLORS.stage.surface}>
      <Flex align="center" gap="4" p="4">
        <Flex align="center" justify="center" boxSize="48px" borderRadius="12px" bg={COLORS.primary.subtle} color={COLORS.primary.base} flexShrink={0}>
          <DocumentIcon size={24} />
        </Flex>
        <Box flex="1" minWidth="0">
          <Text fontWeight="600" color={COLORS.body.heading} truncate>{manual.fileName}</Text>
          <Text fontSize="13px" color={COLORS.body.muted}>
            Uploaded on {formatLongDate(manual.uploadDate)} · {manual.fileType.toUpperCase()} · {formatBytes(manual.fileSize)}
            {isReady && ` · ${manual.rules.length} rules found`}
          </Text>
        </Box>
        <StatusBadge state={state} />
      </Flex>

      {isReady && (
        <Box px="4" pb="3">
          <Button variant="ghost" tone="primary" size="xs" onClick={onToggleRules}>
            {isRulesOpen ? 'Hide extracted rules' : 'View extracted rules'}
          </Button>
          {isRulesOpen && (
            <Box as="ol" mt="2" ps="5" maxHeight="260px" overflowY="auto">
              {manual.rules.map((rule) => (
                <Box as="li" key={rule.ruleId} py="1" fontSize="14px" color={COLORS.body.base}>
                  <Text as="span" fontWeight="600">{rule.ruleName}</Text>
                  <Text as="span" color={COLORS.body.muted}>: {rule.description}</Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {needsProcessing && (
        <Box px="4" pb="4">
          <InlineAlert
            status="warning"
            title={isReady ? `A new file is saved but not processed yet: ${waitingName}` : 'Saved, but not processed yet'}
            description={
              isReady
                ? 'Your current style manual stays in use until the new one is processed.'
                : 'Checks stay locked until the style rules have been extracted from this file.'
            }
            action={
              <Button tone="warning" onClick={onProcess} loading={isProcessing} loadingText="Processing...">
                <RefreshIcon size={16} /> Process now
              </Button>
            }
          />
          {processError && <InlineAlert mt="3" status="error" title="Processing failed" description={processError} />}
        </Box>
      )}
    </Box>
  );
};
