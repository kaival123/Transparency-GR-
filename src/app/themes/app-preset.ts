import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { DEFAULT_THEME_COLOUR, themePalette } from '../core/services/theme.service';

/**
 * Aura with neutral slate surfaces. The brand (primary) colour starts as the default theme colour;
 * ThemeService swaps it at runtime when the user picks another one in the header. All components inherit these tokens.
 */
export const AppPreset = definePreset(Aura, {
  semantic: {
    primary: themePalette(DEFAULT_THEME_COLOUR),
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff', 50: '{slate.50}', 100: '{slate.100}', 200: '{slate.200}', 300: '{slate.300}', 400: '{slate.400}',
          500: '{slate.500}', 600: '{slate.600}', 700: '{slate.700}', 800: '{slate.800}', 900: '{slate.900}', 950: '{slate.950}'
        }
      },
      dark: {
        surface: {
          0: '#ffffff', 50: '{zinc.50}', 100: '{zinc.100}', 200: '{zinc.200}', 300: '{zinc.300}', 400: '{zinc.400}',
          500: '{zinc.500}', 600: '{zinc.600}', 700: '{zinc.700}', 800: '{zinc.800}', 900: '{zinc.900}', 950: '{zinc.950}'
        }
      }
    }
  }
});
