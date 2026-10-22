# Form Inputs

## Input

```jsx
// common/components/Input.jsx
// size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default 'md')
// variant: 'outline' | 'subtle' | 'flushed' (default 'outline')
import { Field, Input as ChakraInput } from "@chakra-ui/react"

export const Input = ({ label, error, invalid = false, ...props }) => {
  return (
    <Field.Root invalid={invalid}>
      {label && <Field.Label>{label}</Field.Label>}
      <ChakraInput {...props} />
      {invalid && error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  )
}
```

## Textarea

```jsx
// common/components/Textarea.jsx
// size: 'xs' | 'sm' | 'md' | 'lg' (default 'md')
// variant: 'outline' | 'subtle' | 'flushed' (default 'outline')
// resize: 'none' | 'vertical' | 'horizontal' | 'both'
import { Textarea as ChakraTextarea } from "@chakra-ui/react"

export const Textarea = ({ placeholder = "Add text here", ...props }) => {
  return <ChakraTextarea placeholder={placeholder} {...props} />
}
```

## Select

```jsx
// common/components/Select.jsx
import { Select as ChakraSelect } from "@chakra-ui/react"

export const Select = ({ items, label, placeholder, ...props }) => {
  return (
    <ChakraSelect.Root collection={items} size="sm" {...props}>
      <ChakraSelect.HiddenSelect />
      {label && <ChakraSelect.Label>{label}</ChakraSelect.Label>}
      <ChakraSelect.Control>
        <ChakraSelect.Trigger>
          <ChakraSelect.ValueText placeholder={placeholder} />
        </ChakraSelect.Trigger>
        <ChakraSelect.IndicatorGroup>
          <ChakraSelect.Indicator />
        </ChakraSelect.IndicatorGroup>
      </ChakraSelect.Control>
      <ChakraSelect.Portal>
        <ChakraSelect.Positioner>
          <ChakraSelect.Content>
            {items.map((item) => (
              <ChakraSelect.Item item={item} key={item.value}>
                {item.label}
                <ChakraSelect.ItemIndicator />
              </ChakraSelect.Item>
            ))}
          </ChakraSelect.Content>
        </ChakraSelect.Positioner>
      </ChakraSelect.Portal>
    </ChakraSelect.Root>
  )
}
```
`items` uses Chakra's own collection shape (`{ label, value }[]`) directly
— `Select.Root` requires a `collection`, not a plain array, and
reinventing that shape generically would add complexity with no real
payoff while only one UI library is in use.

## Checkbox

**Confirmed Chakra limitation, not an oversight:** Chakra's own issue
tracker (`chakra-ui/chakra-ui#7853`) confirms there is no supported way
to set a checkbox's checked-state color to an arbitrary value without
`colorPalette` (which requires theme registration — contradicts [Environment Variables and Design Colors](../03-Configuration-Patterns/01-EnvAndColorConfig.PATTERN.md)'s
rule). Rather than carve out an exception, this component renders its
**own** checked-state visual (a plain `Box`), not Chakra's built-in
`Checkbox.Control`/`Indicator` recipe. `Root` + `HiddenInput` are still
used underneath for real accessibility (keyboard handling, the native
input, focus) — only the colored visual is custom.

**Requires controlled usage** (`checked` + `onCheckedChange`) — the
custom box reads `checked` as a plain prop to decide its own styling, so
uncontrolled usage (`defaultChecked`) would render incorrectly (always
appearing unchecked, since Chakra's internally-managed state would never
reach this component). Not a real loss here — every form input in this
architecture is already controlled via `useForm`.

```jsx
// common/components/Checkbox.jsx
// size: 'xs' | 'sm' | 'md' | 'lg' (default 'md')
// tone: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' (default 'primary')
import { Checkbox as ChakraCheckbox, Box } from "@chakra-ui/react"
import { COLORS } from "@/common/constants"
import { CheckIcon } from "@/adapters/icons"

const SIZES = { xs: "3.5", sm: "4", md: "5", lg: "6" }

export const Checkbox = ({ label, checked, tone = "primary", size = "md", ...props }) => {
  const palette = COLORS[tone]
  const boxSize = SIZES[size]

  return (
    <ChakraCheckbox.Root checked={checked} {...props}>
      <ChakraCheckbox.HiddenInput />
      <Box
        width={boxSize}
        height={boxSize}
        borderRadius="4px"
        borderWidth="1.5px"
        borderColor={checked ? palette.base : COLORS.secondary.base}
        bg={checked ? palette.base : "transparent"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        transition="background 0.15s, border-color 0.15s"
      >
        {checked && <CheckIcon size={boxSize === "3.5" ? 10 : 12} color="white" />}
      </Box>
      {label && <ChakraCheckbox.Label>{label}</ChakraCheckbox.Label>}
    </ChakraCheckbox.Root>
  )
}
```

## Switch

Same reasoning and same approach as `Checkbox` — renders its own
track/thumb visual instead of Chakra's built-in `Switch.Control`/`Thumb`
recipe, for the identical confirmed color limitation. Also requires
controlled usage for the same reason.

```jsx
// common/components/Switch.jsx
// size: 'xs' | 'sm' | 'md' | 'lg' (default 'md')
// tone: same as Checkbox (default 'primary')
import { Switch as ChakraSwitch, Box } from "@chakra-ui/react"
import { COLORS } from "@/common/constants"

const TRACK_SIZES = {
  xs: { width: "6", height: "3.5", thumb: "2.5" },
  sm: { width: "7", height: "4", thumb: "3" },
  md: { width: "9", height: "5", thumb: "4" },
  lg: { width: "11", height: "6", thumb: "5" },
}

export const Switch = ({ label, checked, tone = "primary", size = "md", ...props }) => {
  const palette = COLORS[tone]
  const { width, height, thumb } = TRACK_SIZES[size]

  return (
    <ChakraSwitch.Root checked={checked} {...props}>
      <ChakraSwitch.HiddenInput />
      <Box
        width={width}
        height={height}
        borderRadius="full"
        bg={checked ? palette.base : COLORS.secondary.subtle}
        display="flex"
        alignItems="center"
        px="0.5"
        justifyContent={checked ? "flex-end" : "flex-start"}
        transition="background 0.15s"
      >
        <Box width={thumb} height={thumb} borderRadius="full" bg="white" transition="transform 0.15s" />
      </Box>
      {label && <ChakraSwitch.Label>{label}</ChakraSwitch.Label>}
    </ChakraSwitch.Root>
  )
}
```

## PinInput

```jsx
// common/components/PinInput.jsx
// type: 'numeric' | 'alphanumeric' | 'alphabetic' (default 'numeric')
// size: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' (default 'md')
// variant: 'outline' | 'subtle' | 'flushed' (default 'outline')
import { PinInput as ChakraPinInput, Group } from "@chakra-ui/react"

export const PinInput = ({ count = 4, attached, ...props }) => {
  return (
    <ChakraPinInput.Root {...props}>
      <ChakraPinInput.HiddenInput />
      <ChakraPinInput.Control>
        <Group attached={attached}>
          {Array.from({ length: count }).map((_, index) => (
            <ChakraPinInput.Input key={index} index={index} />
          ))}
        </Group>
      </ChakraPinInput.Control>
    </ChakraPinInput.Root>
  )
}
```
