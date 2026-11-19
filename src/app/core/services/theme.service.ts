import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';
import { ColorScale, palette, updatePrimaryPalette } from '@primeuix/themes';
import { TranslationKey } from '../i18n/en';
import { PreferencesService } from './preferences.service';

export const DARK_MODE_CLASS = 'app-dark';

export type ThemeColour = 'orange' | 'blue' | 'teal' | 'magenta' | 'black';

export interface ThemeColourOption {
  id: ThemeColour;
  label: TranslationKey;
  /** Base (500) shade; PrimeNG derives the other shades from it. */
  hex: string;
}

export const THEME_COLOURS: readonly ThemeColourOption[] = [
  { id: 'orange', label: 'theme.orange', hex: '#e8710a' },
  { id: 'blue', label: 'theme.blue', hex: '#1f3fd1' },
  { id: 'teal', label: 'theme.teal', hex: '#2b7a78' },
  { id: 'magenta', label: 'theme.magenta', hex: '#b8287f' },
  { id: 'black', label: 'theme.black', hex: '#1a1a1a' }
];

export const DEFAULT_THEME_COLOUR: ThemeColour = 'teal';

export const themeColourHex = (id: ThemeColour): string =>
  (THEME_COLOURS.find((c) => c.id === id) ?? THEME_COLOURS.find((c) => c.id === DEFAULT_THEME_COLOUR)!).hex;

/** Full 50–950 shade scale for a theme colour (a hex input always yields a scale, never a string). */
export const themePalette = (id: ThemeColour): ColorScale => palette(themeColourHex(id)) as ColorScale;

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly prefs = inject(PreferencesService);

  readonly dark = signal<boolean>(this.prefs.get('dark', this.systemPrefersDark()));
  readonly colour = signal<ThemeColour>(this.validColour(this.prefs.get<string>('colour', DEFAULT_THEME_COLOUR)));

  constructor() {
    effect(() => {
      const dark = this.dark();
      this.document.documentElement.classList.toggle(DARK_MODE_CLASS, dark);
      this.prefs.set('dark', dark);
    });
    effect(() => {
      const colour = this.colour();
      updatePrimaryPalette(themePalette(colour));
      this.prefs.set('colour', colour);
    });
  }

  toggle(): void {
    this.dark.update((d) => !d);
  }

  setColour(colour: ThemeColour): void {
    this.colour.set(colour);
  }

  private validColour(value: string): ThemeColour {
    return THEME_COLOURS.some((c) => c.id === value) ? (value as ThemeColour) : DEFAULT_THEME_COLOUR;
  }

  private systemPrefersDark(): boolean {
    return this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
