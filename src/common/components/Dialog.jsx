import { Dialog as ChakraDialog, Portal } from '@chakra-ui/react';
import { COLORS } from '@/common/constants';
import { Button } from './Button';
import { Text } from './Typography';

/** Controlled modal (`open` / `onOpenChange`). */
export const Dialog = ({ open, onOpenChange, title, children, footer, size = 'md' }) => (
  <ChakraDialog.Root open={open} onOpenChange={(details) => onOpenChange?.(details.open)} placement="center" size={size}>
    <Portal>
      <ChakraDialog.Backdrop bg={COLORS.overlay.base} />
      <ChakraDialog.Positioner>
        <ChakraDialog.Content borderRadius="16px" bg={COLORS.stage.base}>
          {title && (
            <ChakraDialog.Header>
              <ChakraDialog.Title color={COLORS.body.heading}>{title}</ChakraDialog.Title>
            </ChakraDialog.Header>
          )}
          <ChakraDialog.Body color={COLORS.body.base}>{children}</ChakraDialog.Body>
          {footer && <ChakraDialog.Footer gap="3">{footer}</ChakraDialog.Footer>}
        </ChakraDialog.Content>
      </ChakraDialog.Positioner>
    </Portal>
  </ChakraDialog.Root>
);

/** Driven by `useConfirm`. Destructive actions run only after the user confirms here. */
export const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'error', onConfirm, onCancel }) => (
  <Dialog
    open={open}
    onOpenChange={(isOpen) => !isOpen && onCancel()}
    title={title}
    footer={
      <>
        <Button variant="outline" tone="secondary" onClick={onCancel}>{cancelLabel}</Button>
        <Button tone={tone} onClick={onConfirm}>{confirmLabel}</Button>
      </>
    }
  >
    <Text>{message}</Text>
  </Dialog>
);
