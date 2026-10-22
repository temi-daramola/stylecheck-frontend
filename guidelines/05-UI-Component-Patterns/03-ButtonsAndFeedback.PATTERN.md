# Buttons & Feedback

## Button

```jsx
// common/components/Button.jsx
// variant: 'solid' | 'subtle' | 'surface' | 'outline' | 'ghost' | 'plain' (default 'solid')
// tone: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' — our own
//   prop, NOT Chakra's colorPalette (see the note on Checkbox/Switch below for why).
//   Only applied for variant="solid" (background) and variant="outline"/"ghost"
//   (text + border) — omit for a neutral/default-styled button.
// size: 'xs' | 'sm' | 'md' | 'lg' (default 'md')
// Icons render as plain children, NOT leftIcon/rightIcon (removed in v3)
import { Button as ChakraButton } from "@chakra-ui/react"
import { COLORS } from "@/common/constants"

const toneStyles = (tone, variant) => {
  if (!tone) return {}
  const palette = COLORS[tone]
  if (variant === "outline" || variant === "ghost") {
    return { color: palette.base, borderColor: palette.base, _hover: { bg: palette.subtle } }
  }
  // default: solid
  return { bg: palette.base, color: "white", _hover: { bg: palette.hover } }
}

export const Button = ({ children, tone, variant = "solid", ...props }) => {
  return (
    <ChakraButton variant={variant} {...toneStyles(tone, variant)} {...props}>
      {children}
    </ChakraButton>
  )
}
```

## IconButton

```jsx
// common/components/IconButton.jsx
// variant: 'solid' | 'subtle' | 'surface' | 'outline' | 'ghost' (default 'solid')
// size: 'xs' | 'sm' | 'md' | 'lg' (default 'md')
// tone: same as Button — our own prop, not colorPalette
import { IconButton as ChakraIconButton } from "@chakra-ui/react"
import { COLORS } from "@/common/constants"

const toneStyles = (tone, variant) => {
  if (!tone) return {}
  const palette = COLORS[tone]
  if (variant === "outline" || variant === "ghost") {
    return { color: palette.base, borderColor: palette.base, _hover: { bg: palette.subtle } }
  }
  return { bg: palette.base, color: "white", _hover: { bg: palette.hover } }
}

export const IconButton = ({ icon, label, tone, variant = "solid", ...props }) => {
  return (
    <ChakraIconButton aria-label={label} variant={variant} {...toneStyles(tone, variant)} {...props}>
      {icon}
    </ChakraIconButton>
  )
}
```

## `useDisclosure` — Shared Open/Close Hook

Before the alert components — both need dismiss behavior, and this is
the shared mechanism. Lives in `common/hooks/`, built on plain
`useState`, not dependent on Chakra's own `useDisclosure` — so it works
identically for any component that needs open/close/toggle behavior
(these two alerts now, `Dialog`/`Menu`/`Tooltip`/`ToggleTip` potentially
later, including their eventual Tailwind versions).

```js
// common/hooks/useDisclosure.js
import { useState, useCallback } from "react"

export const useDisclosure = (defaultOpen = false) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return { isOpen, open, close, toggle }
}
```

This is `common/hooks/index.js`'s state as of this point in the file —
`useDisclosure` is defined here; `useConfirm` is defined later in this
same file, alongside `Dialog`/`ConfirmDialog`, since it exists
specifically to support that pattern; the other four are documented in
full where they were originally introduced (`useForm` in
[Form Validation hook](../06-Data-Patterns/11-FormValidationHook.PATTERN.md); the rest in
`06-Data-Patterns/`):

```js
// common/hooks/index.js
export { useForm } from "./useForm"
export { usePagination } from "./usePagination"
export { useQueriesTracker } from "./useQueriesTracker"
export { useMutationWithFeedback } from "./useMutationWithFeedback"
export { useDisclosure } from "./useDisclosure"
export { useConfirm } from "./useConfirm"
```

## InlineAlert

The original `Alert` — icon and text sit side by side, background tied
to status, left-aligned. Renamed from `Alert` for a clear pairing against
`StackedAlert` below, since both actually have an icon; the only real
difference between them is the icon's layout relative to the text.

```jsx
// common/components/InlineAlert.jsx
// status: 'info' | 'warning' | 'error' | 'success' (default 'info')
// dismissible: boolean, default false — opt-in, since many alerts (e.g.
//   a validation error) shouldn't disappear just because they were
//   clicked; the underlying problem is still there
import { Alert as ChakraAlert, CloseButton } from "@chakra-ui/react"

export const InlineAlert = ({ status = "info", title, description, dismissible = false, onClose, ...props }) => {
  return (
    <ChakraAlert.Root status={status} {...props}>
      <ChakraAlert.Indicator />
      <ChakraAlert.Content>
        {title && <ChakraAlert.Title>{title}</ChakraAlert.Title>}
        {description && <ChakraAlert.Description>{description}</ChakraAlert.Description>}
      </ChakraAlert.Content>
      {dismissible && <CloseButton size="sm" onClick={onClose} />}
    </ChakraAlert.Root>
  )
}
```

## StackedAlert

Same as `InlineAlert` in every other way — background tied to status,
left-aligned, icon fixed/auto-determined by status (not customizable),
same `dismissible`/`onClose` support — except the icon renders **above**
the title/description instead of beside it.

```jsx
// common/components/StackedAlert.jsx
// status: 'info' | 'warning' | 'error' | 'success' (default 'info')
// dismissible: boolean, default false — same reasoning as InlineAlert
import { Alert as ChakraAlert, CloseButton } from "@chakra-ui/react"

export const StackedAlert = ({ status = "info", title, description, dismissible = false, onClose, ...props }) => {
  return (
    <ChakraAlert.Root status={status} flexDirection="column" alignItems="flex-start" {...props}>
      <ChakraAlert.Indicator />
      <ChakraAlert.Content>
        {title && <ChakraAlert.Title>{title}</ChakraAlert.Title>}
        {description && <ChakraAlert.Description>{description}</ChakraAlert.Description>}
      </ChakraAlert.Content>
      {dismissible && <CloseButton size="sm" onClick={onClose} />}
    </ChakraAlert.Root>
  )
}
```

**Usage — controlled via `useDisclosure`:**
```jsx
const { isOpen, close } = useDisclosure(true)

{isOpen && (
  <InlineAlert status="info" title="Heads up" description="This is dismissible." dismissible onClose={close} />
)}
```

## BaseNotify and StatusNotify

Two distinct components — **not** two variants of one component — used
whenever a page reads data and needs to show either an empty result or an
error, in place of building two separate redundant components for those
two cases. Visually different from `InlineAlert`/`StackedAlert`: **no
background**, and **horizontally centered** (icon, title, message, and
an optional action button, all center-aligned), instead of the alerts'
left-aligned, backgrounded layout.

**`BaseNotify`** is the foundational, fully customizable one — the caller
passes any icon element directly, no fixed icon-selection logic at all:

```jsx
// common/components/BaseNotify.jsx
import { Stack, Text } from "@chakra-ui/react"
import { Button } from "./Button"

export const BaseNotify = ({ icon, title, message, actionLabel, onAction, ...props }) => {
  return (
    <Stack align="center" textAlign="center" gap="3" {...props}>
      {icon}
      {title && <Text fontWeight="semibold">{title}</Text>}
      {message && <Text color="fg.muted">{message}</Text>}
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </Stack>
  )
}
```

**`StatusNotify`** is built on top of `BaseNotify`, adding automatic icon
selection driven by a `state` prop — not customizable, same principle as
`InlineAlert`'s auto-icon behavior:

```jsx
// common/components/StatusNotify.jsx
// state: 'empty' | 'error' | 'success' | 'info' (default 'empty') —
//   determines which icon renders; NOT customizable — use BaseNotify
//   directly if a specific custom icon is needed
import { EmptyIcon, ErrorIcon, SuccessIcon, InfoIcon } from "@/adapters/icons"
import { BaseNotify } from "./BaseNotify"

const ICONS_BY_STATE = {
  empty: EmptyIcon,
  error: ErrorIcon,
  success: SuccessIcon,
  info: InfoIcon,
}

export const StatusNotify = ({ state = "empty", title, message, actionLabel, onAction, ...props }) => {
  const StateIcon = ICONS_BY_STATE[state]
  return (
    <BaseNotify
      icon={<StateIcon size={32} />}
      title={title}
      message={message}
      actionLabel={actionLabel}
      onAction={onAction}
      {...props}
    />
  )
}
```

**Usage — the error case this was designed for:**
```jsx
<StatusNotify
  state="error"
  title="Couldn't load invoices"
  message={error.message}
  actionLabel="Try again"
  onAction={retry}
/>
```

**Usage — a plain empty state, no button:**
```jsx
<StatusNotify state="empty" title="No invoices yet" message="Create your first invoice to get started." />
```

**Usage — custom icon, via the base directly:**
```jsx
<BaseNotify
  icon={<CustomIcon size={32} />}
  title="Almost there"
  message="Verify your email to continue."
/>
```

## LoadingNotify

A third member of the same family, also built on top of `BaseNotify` —
same reasoning as `StatusNotify`, but fixes the icon slot to always be
the `Spinner` component specifically, rather than auto-selecting from a
`state` prop. Used for a loading state that needs the full
title/message/optional-button structure (e.g. a whole page or section
still loading its initial data) — as opposed to `PageLoadingIndicator`
above, which is a small, click-through, page-corner notice for a
*background* operation like a form save, not a full-content loading
state.

```jsx
// common/components/LoadingNotify.jsx
import { BaseNotify } from "./BaseNotify"
import { Spinner } from "./Spinner"

export const LoadingNotify = ({ title, message, actionLabel, onAction, spinnerProps, ...props }) => {
  return (
    <BaseNotify
      icon={<Spinner size="lg" {...spinnerProps} />}
      title={title}
      message={message}
      actionLabel={actionLabel}
      onAction={onAction}
      {...props}
    />
  )
}
```

`spinnerProps` is an escape hatch to adjust the spinner itself (size,
color) without swapping it out entirely — the whole point of
`LoadingNotify` is that the visual is fixed to `Spinner`, not
customizable to something else; `BaseNotify` directly is still the right
choice whenever the loading visual itself needs to be something other
than a spinner.

**Usage:**
```jsx
<LoadingNotify title="Loading invoices" message="This won't take long." />
```

## Spinner

```jsx
// common/components/Spinner.jsx
// size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
// tone: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' —
//   our own prop, not colorPalette. Spinner's coloring is a plain CSS
//   `color` value (not a compound recipe like Checkbox/Switch), so this
//   is safe to override directly.
import { Spinner as ChakraSpinner } from "@chakra-ui/react"
import { COLORS } from "@/common/constants"

export const Spinner = ({ tone, ...props }) => (
  <ChakraSpinner color={tone ? COLORS[tone].base : undefined} {...props} />
)
```

## Skeleton / SkeletonCircle

```jsx
// common/components/Skeleton.jsx
// Two separate, basic components — matches Chakra's own underlying pieces
// directly rather than forcing them into one artificial combined component
import { Skeleton as ChakraSkeleton, SkeletonCircle as ChakraSkeletonCircle } from "@chakra-ui/react"

export const Skeleton = (props) => <ChakraSkeleton {...props} />
export const SkeletonCircle = (props) => <ChakraSkeletonCircle {...props} />
```

## PageLoadingIndicator

Ported from an existing Tailwind implementation. A fully controlled,
stateless component — no internal state, everything comes from props.
Renders a small pill fixed to the top of the viewport, containing a
spinner and a message, whenever `isLoading` is true; renders nothing at
all otherwise.

**Click-through by design** (`pointerEvents="none"`) — this is purely
informational, never blocks interaction with the rest of the page. Pairs
naturally with `ContentBlockerOverlay` below when a specific region also
needs to become genuinely unclickable during the same operation, but the
two are independent — neither depends on the other.

```jsx
// common/components/PageLoadingIndicator.jsx
import { Box, HStack } from "@chakra-ui/react"
import { Spinner } from "./Spinner"
import { Text } from "./Text"

export const PageLoadingIndicator = ({ isLoading = false, message = "Saving changes...", offsetTop = "1.5rem" }) => {
  if (!isLoading) return null

  return (
    <Box pointerEvents="none" position="fixed" insetX="0" top="0" zIndex={1400} display="flex" justifyContent="center" px="4">
      <HStack mt={offsetTop} gap="2" bg="blackAlpha.900" color="white" px="4" py="2" rounded="full" boxShadow="lg">
        <Spinner size="sm" color="white" />
        <Text fontSize="sm">{message}</Text>
      </HStack>
    </Box>
  )
}
```

Uses the existing `Spinner` component rather than an icon from the icons
adapter ([Icons Adapter](../04-Adapter-Patterns/09-IconsAdapter.PATTERN.md)) — the original Tailwind version had to build spin
animation manually onto a static icon, since Tailwind has no dedicated
spinner component; Chakra already ships one, and it's already wrapped, so
reusing it here is more idiomatic than reintroducing an icon-based
spinner in parallel.

**Usage — wired to `useForm`'s `isSubmitting`:**
```jsx
<PageLoadingIndicator isLoading={isSubmitting} message="Saving invoice..." />
```

## ContentBlockerOverlay

Also ported from an existing Tailwind implementation, also fully
controlled and stateless. Wraps whatever `children` are passed; when
`isActive` is true, layers a semi-transparent, blurred overlay directly
on top of them.

**Actively blocks interaction** (`pointerEvents="auto"`) — the opposite
of `PageLoadingIndicator` above. Whatever it covers becomes genuinely
unclickable while `isActive` is true. Marked `aria-hidden="true"`, since
it's a purely visual blocking layer, not meaningful content.

```jsx
// common/components/ContentBlockerOverlay.jsx
import { Box } from "@chakra-ui/react"

export const ContentBlockerOverlay = ({ isActive = false, overlayProps, children }) => {
  return (
    <Box position="relative">
      {children}
      {isActive && (
        <Box
          position="absolute"
          inset="0"
          zIndex={1300}
          bg="blackAlpha.100"
          backdropFilter="blur(4px)"
          pointerEvents="auto"
          aria-hidden="true"
          {...overlayProps}
        />
      )}
    </Box>
  )
}
```

`overlayProps` replaces the original `overlayClassName` — Chakra's
idiomatic extension point is spreading extra style props, not appending
CSS class strings the way a Tailwind-first component typically would.

**On the `zIndex` values (1400/1300) used by both components above:**
plain numbers, not semantic tokens like `"overlay"`/`"modal"` — Chakra
v3's default theme was not confirmed to ship those specific semantic
z-index tokens out of the box, so explicit numbers are used instead of
asserting a token name that may not exist by default.

**Usage — both together, driven by the same `isSubmitting` state, so the
form is locked from interaction AND the passive "saving" indicator shows
at the same time, both turning off together the instant the request
resolves (success or failure):**
```jsx
// modules/invoice/pages/invoice-create-page/InvoiceCreatePage.jsx
import { ContentBlockerOverlay, PageLoadingIndicator, Input } from "@/common/components"
import { useInvoiceCreateForm } from "@/modules/invoice/hooks/useInvoiceCreateForm"

export const InvoiceCreatePage = () => {
  const { values, errors, formError, isSubmitting, handleChange, handleSubmit } =
    useInvoiceCreateForm()

  return (
    <>
      <ContentBlockerOverlay isActive={isSubmitting}>
        <form onSubmit={handleSubmit}>
          {formError && <div>{formError}</div>}
          <Input
            label="Client name"
            invalid={!!errors.clientName}
            error={errors.clientName}
            value={values.clientName}
            onChange={(e) => handleChange("clientName", e.target.value)}
          />
          <button type="submit" disabled={isSubmitting}>Create invoice</button>
        </form>
      </ContentBlockerOverlay>
      <PageLoadingIndicator isLoading={isSubmitting} message="Saving invoice..." />
    </>
  )
}
```
