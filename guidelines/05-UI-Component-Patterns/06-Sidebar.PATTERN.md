# Sidebar (Dashboard Layout)

**Lives in `layouts/dashboard-layout/`, not `common/components/`** — this
is a layout-specific co-located component ([Folder Structure](../02-Architecture-Patterns/02-FolderStructure.PATTERN.md)'s layout rule), not a
general-purpose UI primitive. Documented here because it's still a
Chakra implementation like everything else in this file.

**Colors used below now reference `COLORS` from `common/constants/`
([Environment Variables and Design Colors](../03-Configuration-Patterns/01-EnvAndColorConfig.PATTERN.md))** — this section originally shipped
with Chakra's default gray scale as a placeholder; updated once the
color config and its variant structure existed.

Built and refined interactively against a reference design before being
written here — final behavior, confirmed:
- Collapses to icon-only (not fully hidden), triggered by a compact,
  right-aligned button in its own row directly below the brand — never
  merged into or overlapping the logo itself, which never changes
  position or disappears.
- Collapse state persists across page loads via the storage adapter.
- The entire sidebar — including the brand row and trigger — scrolls as
  ONE region, with the scrollbar flush at the sidebar's outer edge, not
  inset by padding.
- Nav items with children expand inline (with a connecting tree-line)
  when the sidebar is expanded; when collapsed, they open as a flyout
  via the `Menu` component instead, since there's no room to show nested
  items inline in a narrow rail.
- Active item: solid background, no borders anywhere in any state
  (resting/hover/active are purely background-color driven).
- Brand supports logo and/or text independently — both are optional
  props.

## `useSidebarCollapse`

```js
// layouts/dashboard-layout/useSidebarCollapse.js
import { useState, useCallback } from "react"
import { getItem, setItem } from "@/adapters/storage"

const STORAGE_KEY = "sidebar_collapsed"

export const useSidebarCollapse = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => getItem(STORAGE_KEY) === "true")

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  return { isCollapsed, toggle }
}
```

## `SidebarNavItem`

```jsx
// layouts/dashboard-layout/SidebarNavItem.jsx
import { useState } from "react"
import { Box, Flex, Text } from "@chakra-ui/react"
import { IconButton, Menu } from "@/common/components"
import { useNavigation, useRouteLocation } from "@/adapters/router"
import { ChevronDownIcon } from "@/adapters/icons"
import { COLORS } from "@/common/constants"

export const SidebarNavItem = ({ item, isCollapsed }) => {
  const { path } = useRouteLocation()
  const { goTo } = useNavigation()
  const [isOpen, setIsOpen] = useState(false)
  const hasChildren = item.children?.length > 0
  const isActive = path === item.href

  // Collapsed + has children → flyout menu, since there's no room to
  // show nested items inline in a narrow rail
  if (hasChildren && isCollapsed) {
    return (
      <Menu
        trigger={<IconButton icon={item.icon} label={item.label} variant={isActive ? "solid" : "ghost"} />}
        items={item.children.map((child) => ({ value: child.href, label: child.label }))}
        onSelect={(href) => goTo(href)}
      />
    )
  }

  // Collapsed, no children → icon-only, centered
  if (isCollapsed) {
    return (
      <IconButton
        icon={item.icon}
        label={item.label}
        variant={isActive ? "solid" : "ghost"}
        onClick={() => goTo(item.href)}
      />
    )
  }

  // Expanded, has children → inline expand/collapse with a connecting
  // tree-line on the sublist (border-left)
  if (hasChildren) {
    return (
      <Box>
        <Flex
          align="center"
          gap="3"
          px="3"
          py="2.5"
          borderRadius="12px"
          cursor="pointer"
          onClick={() => setIsOpen((prev) => !prev)}
          bg={isActive ? COLORS.primary.base : "transparent"}
          color={isActive ? "white" : COLORS.body.muted}
          _hover={{ bg: isActive ? COLORS.primary.hover : COLORS.secondary.subtle }}
        >
          {item.icon}
          <Text flex="1" fontSize="sm">{item.label}</Text>
          <ChevronDownIcon
            style={{ transform: isOpen ? "rotate(180deg)" : undefined, transition: "transform 0.15s" }}
          />
        </Flex>
        {isOpen && (
          <Box ml="5" pl="4" borderLeftWidth="1px" borderColor={COLORS.secondary.subtle} mt="0.5">
            {item.children.map((child) => (
              <Text
                key={child.href}
                as="button"
                display="block"
                width="full"
                textAlign="left"
                fontSize="xs"
                px="2"
                py="2"
                borderRadius="10px"
                cursor="pointer"
                color={COLORS.body.muted}
                _hover={{ bg: COLORS.secondary.subtle }}
                onClick={() => goTo(child.href)}
              >
                {child.label}
              </Text>
            ))}
          </Box>
        )}
      </Box>
    )
  }

  // Expanded, no children → plain item
  return (
    <Flex
      align="center"
      gap="3"
      px="3"
      py="2.5"
      borderRadius="12px"
      cursor="pointer"
      onClick={() => goTo(item.href)}
      bg={isActive ? COLORS.primary.base : "transparent"}
      color={isActive ? "white" : COLORS.body.muted}
      _hover={{ bg: isActive ? COLORS.primary.hover : COLORS.secondary.subtle }}
    >
      {item.icon}
      <Text fontSize="sm">{item.label}</Text>
    </Flex>
  )
}
```

## `Sidebar`

```jsx
// layouts/dashboard-layout/Sidebar.jsx
// items: { label, icon, href, children?: [{ label, href }] }[] — a
//   `{ divider: true }` entry renders a dashed section divider instead
// logo / brandName: both optional, independently — supports logo-only,
//   text-only, or both together
import { Box, Flex, Text } from "@chakra-ui/react"
import { IconButton } from "@/common/components"
import { ChevronLeftIcon, ChevronRightIcon } from "@/adapters/icons"
import { COLORS } from "@/common/constants"
import { useSidebarCollapse } from "./useSidebarCollapse"
import { SidebarNavItem } from "./SidebarNavItem"

export const Sidebar = ({ logo, brandName, items }) => {
  const { isCollapsed, toggle } = useSidebarCollapse()

  return (
    <Box
      as="nav"
      width={isCollapsed ? "17" : "62"}
      transition="width 0.2s ease"
      overflowY="auto"
      height="100vh"
      borderRightWidth="1px"
      borderColor={COLORS.secondary.subtle}
      css={{
        "&::-webkit-scrollbar": { width: "5px" },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": { background: COLORS.secondary.base, borderRadius: "9999px" },
        scrollbarWidth: "thin",
        scrollbarColor: `${COLORS.secondary.base} transparent`,
      }}
    >
      <Box p="3">
        <Flex align="center" gap="2.5" px="2.5" py="2.5" justify={isCollapsed ? "center" : "flex-start"}>
          {logo}
          {!isCollapsed && brandName && (
            <Text fontWeight="medium" fontSize="sm" color={COLORS.body.base}>{brandName}</Text>
          )}
        </Flex>

        <Flex justify={isCollapsed ? "center" : "flex-end"} mb="3">
          <IconButton
            icon={isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            label="Toggle sidebar"
            variant="ghost"
            size="sm"
            onClick={toggle}
          />
        </Flex>

        <Flex direction="column" gap="0.5">
          {items.map((item, index) =>
            item.divider ? (
              <Box
                key={`divider-${index}`}
                borderTopWidth="1px"
                borderStyle="dashed"
                borderColor={COLORS.secondary.subtle}
                my="2"
                mx="1"
              />
            ) : (
              <SidebarNavItem key={item.href} item={item} isCollapsed={isCollapsed} />
            )
          )}
        </Flex>
      </Box>
    </Box>
  )
}
```

## Wiring into `DashboardLayout`

```jsx
// layouts/dashboard-layout/DashboardLayout.jsx
import { Flex, Box } from "@chakra-ui/react"
import { Outlet } from "@/adapters/router"
import { ErrorBoundary } from "@/common/components"
import { Sidebar } from "./Sidebar"

const navItems = [
  { label: "Dashboard", icon: /* icon element */ null, href: "/dashboard" },
  { label: "Invoices", icon: /* icon element */ null, href: "/dashboard/invoices" },
  { label: "Clients", icon: /* icon element */ null, children: [
    { label: "All clients", href: "/dashboard/clients" },
    { label: "Add client", href: "/dashboard/clients/new" },
  ] },
  { divider: true },
  { label: "Settings", icon: /* icon element */ null, href: "/dashboard/settings" },
]

export const DashboardLayout = () => (
  <Flex height="100vh">
    <Sidebar logo={/* app logo element */ null} brandName="Acme Inc" items={navItems} />
    <Box flex="1" overflowY="auto">
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </Box>
  </Flex>
)
```

`navItems` and the logo are project-specific — filled in here as a shape
reference, not literal content to copy.

```js
// layouts/dashboard-layout/index.js
export { DashboardLayout } from "./DashboardLayout"
export { Sidebar } from "./Sidebar"
```
