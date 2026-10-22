# Overlays

## Dialog

```jsx
// common/components/Dialog.jsx
// size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' (default 'md') —
//   anything requested above 'xl' collapses to 'xl' in v3
// placement: 'center' | 'top' | 'bottom'
// scrollBehavior: 'inside' | 'outside' (default 'outside')
// motionPreset: 'slideInBottom' | 'slideInRight' | 'scale' | 'none'
// trigger: optional — omit entirely for a fully controlled dialog opened
//   imperatively (e.g. via useConfirm below) rather than by clicking a
//   visible element; control it with `open`/`onOpenChange` (both real
//   ChakraDialog.Root props, passed through via ...props) instead
// backdropPointerEvents: 'auto' (default) | 'none' — 'auto' is standard
//   modal behavior, the backdrop captures clicks so nothing behind it is
//   reachable. 'none' lets clicks pass straight through the backdrop to
//   whatever's rendered behind it — NOT the same thing as
//   closeOnInteractOutside={false}, which only stops an outside click
//   from closing the dialog; it doesn't make the page behind it
//   interactive. Needed specifically by 09-Access-Control-Patterns/02-AccessGating's
//   gate modal, which blocks the one page but must leave the rest of the
//   app shell (sidebar, nav) usable underneath it.
import { Dialog as ChakraDialog, Portal, CloseButton } from "@chakra-ui/react"

export const Dialog = ({ trigger, title, children, footer, showCloseButton = true, backdropPointerEvents = "auto", ...props }) => {
  return (
    <ChakraDialog.Root {...props}>
      {trigger && <ChakraDialog.Trigger asChild>{trigger}</ChakraDialog.Trigger>}
      <Portal>
        <ChakraDialog.Backdrop pointerEvents={backdropPointerEvents} />
        <ChakraDialog.Positioner>
          <ChakraDialog.Content>
            {title && (
              <ChakraDialog.Header>
                <ChakraDialog.Title>{title}</ChakraDialog.Title>
              </ChakraDialog.Header>
            )}
            <ChakraDialog.Body>{children}</ChakraDialog.Body>
            {footer && <ChakraDialog.Footer>{footer}</ChakraDialog.Footer>}
            {showCloseButton && (
              <ChakraDialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </ChakraDialog.CloseTrigger>
            )}
          </ChakraDialog.Content>
        </ChakraDialog.Positioner>
      </Portal>
    </ChakraDialog.Root>
  )
}
```

## `useConfirm` + `ConfirmDialog`

A generic confirmation flow — not delete-specific, so it also covers any
other "are you sure?" moment (discard changes, bulk actions, etc.), not
just deletion.

`useConfirm` (in `common/hooks/`) exposes a `confirm()` function that
returns a real promise, resolving to `true`/`false` based on the user's
choice — so a caller can `await` the result inline, rather than manually
wiring up open/close state and callbacks for every confirmation moment:

```js
// common/hooks/useConfirm.js
import { useState, useCallback } from "react"

export const useConfirm = () => {
  const [state, setState] = useState(null)

  const confirm = useCallback(({ title, message }) => {
    return new Promise((resolve) => {
      setState({ title, message, resolve })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    state?.resolve(true)
    setState(null)
  }, [state])

  const handleCancel = useCallback(() => {
    state?.resolve(false)
    setState(null)
  }, [state])

  return {
    confirm,
    isOpen: !!state,
    title: state?.title,
    message: state?.message,
    handleConfirm,
    handleCancel,
  }
}
```

`useConfirm` is already listed in `common/hooks/index.js` alongside
`useDisclosure`, shown earlier in this file.

`ConfirmDialog` is built on the now-optional-trigger `Dialog` above,
fully controlled via `isOpen` rather than a visible trigger element:

```jsx
// common/components/ConfirmDialog.jsx
import { Dialog } from "./Dialog"
import { Button } from "./Button"

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) onCancel()
      }}
      title={title}
      showCloseButton={false}
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
          <Button tone={isDestructive ? "error" : undefined} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message}
    </Dialog>
  )
}
```

**Usage — wired into an actual delete:**
```jsx
const { confirm, isOpen, title, message, handleConfirm, handleCancel } = useConfirm()
const deleteInvoice = useDeleteInvoice(currentPage)

const handleDeleteClick = async (invoiceId) => {
  const confirmed = await confirm({
    title: "Delete invoice?",
    message: "This action cannot be undone.",
  })
  if (confirmed) deleteInvoice(invoiceId)
}

// ...
<ConfirmDialog
  isOpen={isOpen}
  title={title}
  message={message}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  confirmLabel="Delete"
  isDestructive
/>
```

The un-closable session-expiry modal
(either auth pattern file — its Session-Expiry Modal section) is built from this same
component — `showCloseButton={false}` plus forwarding `closeOnEscape={false}
closeOnInteractOutside={false}` (both real `Dialog.Root` props, passed
through via `...props`) fully locks it down with no extra code.

[Access Gating Pattern](../09-Access-Control-Patterns/02-AccessGating.PATTERN.md)'s gate modal is also built from
this same component, but needs the additional `backdropPointerEvents="none"`
shown above — unlike the session-expiry case, that modal must leave the
rest of the app shell clickable underneath it, not just stay undismissable
itself.

## Menu

```jsx
// common/components/Menu.jsx
import { Menu as ChakraMenu, Portal } from "@chakra-ui/react"

export const Menu = ({ trigger, items, onSelect, ...props }) => {
  return (
    <ChakraMenu.Root {...props}>
      <ChakraMenu.Trigger asChild>{trigger}</ChakraMenu.Trigger>
      <Portal>
        <ChakraMenu.Positioner>
          <ChakraMenu.Content>
            {items.map((item) => (
              <ChakraMenu.Item
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                onSelect={() => onSelect?.(item.value)}
              >
                {item.label}
              </ChakraMenu.Item>
            ))}
          </ChakraMenu.Content>
        </ChakraMenu.Positioner>
      </Portal>
    </ChakraMenu.Root>
  )
}
```
`items` is our own flattened shape (`{ value, label, disabled }[]`), same
pattern as `Select`. A single `onSelect(value)` callback is wired
internally to each item's real `onSelect` — confirmed via Chakra's v3
migration docs that this callback lives per-item, not on `Root`, unlike
`Select`'s single `onValueChange`.

## Tooltip

```jsx
// common/components/Tooltip.jsx
// This is Chakra's own official snippet source (verified against their
// docs), converted from TypeScript to plain JS — already correct as-is.
import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react"

export const Tooltip = ({ showArrow, children, disabled, portalled = true, content, contentProps, portalRef, ...props }) => {
  if (disabled) return children
  return (
    <ChakraTooltip.Root {...props}>
      <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
      <Portal disabled={!portalled} container={portalRef}>
        <ChakraTooltip.Positioner>
          <ChakraTooltip.Content {...contentProps}>
            {showArrow && (
              <ChakraTooltip.Arrow>
                <ChakraTooltip.ArrowTip />
              </ChakraTooltip.Arrow>
            )}
            {content}
          </ChakraTooltip.Content>
        </ChakraTooltip.Positioner>
      </Portal>
    </ChakraTooltip.Root>
  )
}
```

## ToggleTip

```jsx
// common/components/ToggleTip.jsx
// Also Chakra's own official snippet source — built on Popover under the hood
import { Popover as ChakraPopover, IconButton, Portal } from "@chakra-ui/react"

export const ToggleTip = ({ showArrow, children, portalled = true, content, contentProps, portalRef, ...props }) => {
  return (
    <ChakraPopover.Root {...props} positioning={{ ...props.positioning, gutter: 4 }}>
      <ChakraPopover.Trigger asChild>{children}</ChakraPopover.Trigger>
      <Portal disabled={!portalled} container={portalRef}>
        <ChakraPopover.Positioner>
          <ChakraPopover.Content width="auto" px="2" py="1" textStyle="xs" rounded="sm" {...contentProps}>
            {showArrow && (
              <ChakraPopover.Arrow>
                <ChakraPopover.ArrowTip />
              </ChakraPopover.Arrow>
            )}
            {content}
          </ChakraPopover.Content>
        </ChakraPopover.Positioner>
      </Portal>
    </ChakraPopover.Root>
  )
}
```
