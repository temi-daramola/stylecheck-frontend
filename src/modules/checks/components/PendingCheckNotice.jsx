import { Flex, Button, InlineAlert } from '@/common/components';
import { RefreshIcon } from '@/adapters/icons';

/**
 * Shown when a document was read and saved but its AI analysis did not finish. "Try again" re-runs only
 * the analysis on the saved content (nothing is uploaded again); "Start over" drops the saved attempt.
 */
export const PendingCheckNotice = ({ pending, isRetrying, onRetry, onDismiss }) => (
  <InlineAlert
    status="warning"
    title={`${pending.studentName}'s document was read, but the analysis did not finish`}
    description={`${pending.message} Your document is saved, so you do not need to upload it again.`}
    action={
      <Flex gap="2" flexShrink={0}>
        <Button tone="warning" onClick={onRetry} loading={isRetrying} loadingText="Analysing...">
          <RefreshIcon size={16} /> Try again
        </Button>
        <Button variant="outline" tone="secondary" onClick={onDismiss} disabled={isRetrying}>Start over</Button>
      </Flex>
    }
  />
);
