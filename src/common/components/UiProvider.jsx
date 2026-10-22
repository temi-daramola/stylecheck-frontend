import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { COLORS } from '@/common/constants';

// Global styles reference COLORS: no raw color value lives outside Colors.js.
const system = createSystem(
  defaultConfig,
  defineConfig({
    globalCss: {
      html: { colorScheme: 'light' },
      body: {
        bg: COLORS.stage.surface,
        color: COLORS.body.base,
        fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      },
    },
  })
);

export const UiProvider = ({ children }) => <ChakraProvider value={system}>{children}</ChakraProvider>;
