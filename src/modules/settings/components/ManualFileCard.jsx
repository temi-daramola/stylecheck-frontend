import { Flex, Box, Text, Button, HStack } from '@/common/components';
import { COLORS } from '@/common/constants';
import { DocumentIcon, SuccessIcon } from '@/adapters/icons';
import { formatBytes, formatLongDate } from '@/common/utils';

/** The current style manual: name, upload date, type, size, how many rules were found. */
export const ManualFileCard = ({ manual, isRulesOpen, onToggleRules }) => (
  <Box borderRadius="14px" borderWidth="1px" borderColor={COLORS.secondary.subtle} bg={COLORS.stage.surface}>
    <Flex align="center" gap="4" p="4">
      <Flex align="center" justify="center" boxSize="48px" borderRadius="12px" bg={COLORS.primary.subtle} color={COLORS.primary.base} flexShrink={0}>
        <DocumentIcon size={24} />
      </Flex>
      <Box flex="1" minWidth="0">
        <Text fontWeight="600" color={COLORS.body.heading} truncate>{manual.fileName}</Text>
        <Text fontSize="13px" color={COLORS.body.muted}>
          Uploaded on {formatLongDate(manual.uploadDate)} · {manual.fileType.toUpperCase()} · {formatBytes(manual.fileSize)} · {manual.rules.length} rules found
        </Text>
      </Box>
      <HStack gap="1.5" px="3" py="1" borderRadius="full" bg={COLORS.success.subtle} color={COLORS.success.base} fontSize="13px" fontWeight="600" flexShrink={0}>
        <SuccessIcon size={14} /> Active
      </HStack>
    </Flex>

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
  </Box>
);
