# `common/components/index.js`

This is the real, complete public API of `common/components/` — every
component the project has, not just the ones whose implementation lives
in this file. `PaginatedView` and `DataGate` are behavioral chrome
(loading/error/pagination state), not Chakra primitives, so their full
implementations live in [`PaginatedView`](../06-Data-Patterns/02-Pagination.PATTERN.md)
and [`DataGate`](../06-Data-Patterns/05-DataGate.PATTERN.md) instead — listed here because they genuinely live in this
folder in the real project. `FormSkeleton`/`TableSkeleton`/
`CardSkeleton` ([`DataGate`](../06-Data-Patterns/05-DataGate.PATTERN.md)) are listed the same way.
Error display anywhere in the app uses `InlineAlert`/`StackedAlert`
directly, composed with `status="error"` (or `StatusNotify` with
`state="error"` when a retry action is needed) — there is no separate,
hardcoded error-specific component.

```js
export { Input } from "./Input"
export { Textarea } from "./Textarea"
export { Select } from "./Select"
export { Checkbox } from "./Checkbox"
export { Switch } from "./Switch"
export { PinInput } from "./PinInput"
export { Button } from "./Button"
export { IconButton } from "./IconButton"
export { InlineAlert } from "./InlineAlert"
export { StackedAlert } from "./StackedAlert"
export { BaseNotify } from "./BaseNotify"
export { StatusNotify } from "./StatusNotify"
export { LoadingNotify } from "./LoadingNotify"
export { Spinner } from "./Spinner"
export { Skeleton, SkeletonCircle } from "./Skeleton"
export { PageLoadingIndicator } from "./PageLoadingIndicator"
export { ContentBlockerOverlay } from "./ContentBlockerOverlay"
export { Box } from "./Box"
export { Flex } from "./Flex"
export { Grid } from "./Grid"
export { SimpleGrid } from "./SimpleGrid"
export { Text } from "./Text"
export { Heading } from "./Heading"
export { Link } from "./Link"
export { List, ListItem } from "./List"
export { Image } from "./Image"
export { Avatar } from "./Avatar"
export { Dialog } from "./Dialog"
export { ConfirmDialog } from "./ConfirmDialog"
export { Menu } from "./Menu"
export { Tooltip } from "./Tooltip"
export { ToggleTip } from "./ToggleTip"
export { Breadcrumb } from "./Breadcrumb"
export { Tabs } from "./Tabs"
export { Accordion } from "./Accordion"
export { Table } from "./Table"
export { PaginatedView } from "./PaginatedView"
export { DataGate } from "./DataGate"
export { FormSkeleton } from "./FormSkeleton"
export { TableSkeleton } from "./TableSkeleton"
export { CardSkeleton } from "./CardSkeleton"
```
