# Navigation & Data Display

## Breadcrumb

```jsx
// common/components/Breadcrumb.jsx
// No enumerated variant/size confirmed in current docs — kept minimal
import { Breadcrumb as ChakraBreadcrumb } from "@chakra-ui/react"

export const Breadcrumb = ({ items }) => {
  return (
    <ChakraBreadcrumb.Root>
      <ChakraBreadcrumb.List>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <>
              <ChakraBreadcrumb.Item key={item.href ?? item.label}>
                {isLast ? (
                  <ChakraBreadcrumb.CurrentLink>{item.label}</ChakraBreadcrumb.CurrentLink>
                ) : (
                  <ChakraBreadcrumb.Link href={item.href}>{item.label}</ChakraBreadcrumb.Link>
                )}
              </ChakraBreadcrumb.Item>
              {!isLast && <ChakraBreadcrumb.Separator key={`sep-${index}`} />}
            </>
          )
        })}
      </ChakraBreadcrumb.List>
    </ChakraBreadcrumb.Root>
  )
}
```

## Tabs

```jsx
// common/components/Tabs.jsx
// variant: 'line' | 'subtle' | 'enclosed' | 'outline' | 'plain' (default 'line')
// size: 'sm' | 'md' | 'lg' (default 'md')
// orientation: 'horizontal' | 'vertical' (default 'horizontal')
import { Tabs as ChakraTabs } from "@chakra-ui/react"

export const Tabs = ({ tabs, defaultValue, ...props }) => {
  return (
    <ChakraTabs.Root defaultValue={defaultValue ?? tabs[0]?.value} {...props}>
      <ChakraTabs.List>
        {tabs.map((tab) => (
          <ChakraTabs.Trigger key={tab.value} value={tab.value} disabled={tab.disabled}>
            {tab.icon}
            {tab.label}
          </ChakraTabs.Trigger>
        ))}
      </ChakraTabs.List>
      {tabs.map((tab) => (
        <ChakraTabs.Content key={tab.value} value={tab.value}>
          {tab.content}
        </ChakraTabs.Content>
      ))}
    </ChakraTabs.Root>
  )
}
```

## Accordion

```jsx
// common/components/Accordion.jsx
// variant: 'outline' | 'subtle' | 'enclosed' | 'plain'
// size: 'sm' | 'md' | 'lg' (default 'md')
import { Accordion as ChakraAccordion, Span } from "@chakra-ui/react"

export const Accordion = ({ items, ...props }) => {
  return (
    <ChakraAccordion.Root collapsible {...props}>
      {items.map((item) => (
        <ChakraAccordion.Item key={item.value} value={item.value}>
          <ChakraAccordion.ItemTrigger>
            <Span flex="1">{item.title}</Span>
            <ChakraAccordion.ItemIndicator />
          </ChakraAccordion.ItemTrigger>
          <ChakraAccordion.ItemContent>
            <ChakraAccordion.ItemBody>{item.content}</ChakraAccordion.ItemBody>
          </ChakraAccordion.ItemContent>
        </ChakraAccordion.Item>
      ))}
    </ChakraAccordion.Root>
  )
}
```

## Table

```jsx
// common/components/Table.jsx
// variant: 'line' | 'outline' (default 'line') — changed in v3 from the
//   old simple/striped/unstyled scale; striped is now its own boolean prop
// size: 'sm' | 'md' | 'lg' (default 'md')
import { Table as ChakraTable } from "@chakra-ui/react"

export const Table = ({ columns, rows, ...props }) => {
  return (
    <ChakraTable.Root {...props}>
      <ChakraTable.Header>
        <ChakraTable.Row>
          {columns.map((column) => (
            <ChakraTable.ColumnHeader key={column.key} textAlign={column.align}>
              {column.label}
            </ChakraTable.ColumnHeader>
          ))}
        </ChakraTable.Row>
      </ChakraTable.Header>
      <ChakraTable.Body>
        {rows.map((row, rowIndex) => (
          <ChakraTable.Row key={row.id ?? rowIndex}>
            {columns.map((column) => (
              <ChakraTable.Cell key={column.key} textAlign={column.align}>
                {row[column.key]}
              </ChakraTable.Cell>
            ))}
          </ChakraTable.Row>
        ))}
      </ChakraTable.Body>
    </ChakraTable.Root>
  )
}
```
