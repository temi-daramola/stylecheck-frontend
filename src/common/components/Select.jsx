import { useMemo } from 'react';
import { Select as ChakraSelect, Portal, createListCollection } from '@chakra-ui/react';
import { COLORS } from '@/common/constants';

/**
 * Own prop API: `items` is a plain [{ label, value }] array, `value` a single string and
 * `onChange` receives that string. The library's collection and array-valued API stay in here.
 */
export const Select = ({ label, items, value, onChange, placeholder, ...props }) => {
  const collection = useMemo(() => createListCollection({ items }), [items]);

  return (
    <ChakraSelect.Root
      collection={collection}
      value={value ? [value] : []}
      onValueChange={(details) => onChange?.(details.value[0] ?? '')}
      size="lg"
      {...props}
    >
      <ChakraSelect.HiddenSelect />
      {label && (
        <ChakraSelect.Label fontSize="12px" fontWeight="600" letterSpacing="0.04em" textTransform="uppercase" color={COLORS.body.heading}>
          {label}
        </ChakraSelect.Label>
      )}
      <ChakraSelect.Control>
        <ChakraSelect.Trigger bg={COLORS.stage.surface} borderColor={COLORS.secondary.subtle} borderRadius="10px" color={COLORS.body.base}>
          <ChakraSelect.ValueText placeholder={placeholder} />
        </ChakraSelect.Trigger>
        <ChakraSelect.IndicatorGroup>
          <ChakraSelect.Indicator />
        </ChakraSelect.IndicatorGroup>
      </ChakraSelect.Control>
      <Portal>
        <ChakraSelect.Positioner>
          <ChakraSelect.Content>
            {collection.items.map((item) => (
              <ChakraSelect.Item item={item} key={item.value}>
                {item.label}
                <ChakraSelect.ItemIndicator />
              </ChakraSelect.Item>
            ))}
          </ChakraSelect.Content>
        </ChakraSelect.Positioner>
      </Portal>
    </ChakraSelect.Root>
  );
};
