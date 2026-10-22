# Layout & Typography

These are largely free-form CSS style-prop containers with no closed
Chakra-specific enum to document — `Heading` and `Avatar` are the
exceptions, both listed below.

```jsx
// common/components/Box.jsx
import { Box as ChakraBox } from "@chakra-ui/react"
export const Box = (props) => <ChakraBox {...props} />
```

```jsx
// common/components/Flex.jsx
import { Flex as ChakraFlex } from "@chakra-ui/react"
export const Flex = (props) => <ChakraFlex {...props} />
```

```jsx
// common/components/Grid.jsx
import { Grid as ChakraGrid } from "@chakra-ui/react"
export const Grid = (props) => <ChakraGrid {...props} />
```

```jsx
// common/components/SimpleGrid.jsx
import { SimpleGrid as ChakraSimpleGrid } from "@chakra-ui/react"
export const SimpleGrid = (props) => <ChakraSimpleGrid {...props} />
```

```jsx
// common/components/Text.jsx
// No built-in `size` scale (confirmed — unlike Heading, Text has no
// default theme size prop). Use fontSize with free-form values instead.
import { Text as ChakraText } from "@chakra-ui/react"
export const Text = (props) => <ChakraText {...props} />
```

## Heading

```jsx
// common/components/Heading.jsx
// size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' (default 'xl')
import { Heading as ChakraHeading } from "@chakra-ui/react"
export const Heading = (props) => <ChakraHeading {...props} />
```

```jsx
// common/components/Link.jsx
// variant prop exists but has NO fixed default values out of the box
// (confirmed — Chakra ships no built-in Link variants; they're theme-defined)
import { Link as ChakraLink } from "@chakra-ui/react"
export const Link = (props) => <ChakraLink {...props} />
```

```jsx
// common/components/List.jsx
// No enumerated variant/size — list marker styling uses free-form CSS
// (listStyleType, listStylePosition), not a closed Chakra prop set
import { List as ChakraList } from "@chakra-ui/react"

export const List = (props) => <ChakraList.Root {...props} />
export const ListItem = (props) => <ChakraList.Item {...props} />
```

```jsx
// common/components/Image.jsx
// fit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' — standard CSS
// object-fit values, not Chakra-specific, but a real bounded set
import { Image as ChakraImage } from "@chakra-ui/react"
export const Image = (props) => <ChakraImage {...props} />
```

## Avatar

```jsx
// common/components/Avatar.jsx
// size: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' (default 'md')
// variant: 'solid' | 'outline' | 'subtle'
// shape: 'square' | 'rounded' (default 'rounded')
// tone: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' —
//   our own prop, not colorPalette. Applied to the Fallback's background
//   (shown when there's no image) — a plain bg/color pair, not a compound
//   recipe, so this is safe to override directly.
import { Avatar as ChakraAvatar } from "@chakra-ui/react"
import { COLORS } from "@/common/constants"

export const Avatar = ({ name, src, tone = "secondary", ...props }) => {
  return (
    <ChakraAvatar.Root {...props}>
      <ChakraAvatar.Fallback name={name} bg={COLORS[tone].base} color="white" />
      {src && <ChakraAvatar.Image src={src} />}
    </ChakraAvatar.Root>
  )
}
```
