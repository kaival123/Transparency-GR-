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
  { id: 'blue', label: 'theme.blue', hex: '#0000ff' },
  { id: 'teal', label: 'theme.teal', hex: '#2e8b87' },
  { id: 'magenta', label: 'theme.magenta', hex: '#cc3399' },
  { id: 'black', label: 'theme.black', hex: '#000000' }
];

export const DEFAULT_THEME_COLOUR: ThemeColour = 'orange';

export const themeColourHex = (id: ThemeColour): string =>
  (THEME_COLOURS.find((c) => c.id === id) ?? THEME_COLOURS.find((c) => c.id === DEFAULT_THEME_COLOUR)!).hex;

/** Full 50–950 shade scale for a theme colour (a hex input always yields a scale, never a string). */
export const themePalette = (id: ThemeColour): ColorScale => palette(themeColourHex(id)) as ColorScale;

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly prefs = inject(PreferencesService);

  /** Follows the device's light/dark setting (there is no in-app switch, so nothing is stored). */
  readonly dark = signal<boolean>(this.systemPrefersDark());
  /**
   * Only an explicit user pick is stored, so changing DEFAULT_THEME_COLOUR reaches everyone who never chose.
   * (Key renamed from 'colour', which was written on every load and pinned visitors to the old default.)
   */
  private static readonly COLOUR_KEY = 'themeColour';
  readonly colour = signal<ThemeColour>(
    this.validColour(this.prefs.get<string>(ThemeService.COLOUR_KEY, DEFAULT_THEME_COLOUR))
  );

  constructor() {
    effect(() => {
      const dark = this.dark();
      this.document.documentElement.classList.toggle(DARK_MODE_CLASS, dark);
    });
    effect(() => updatePrimaryPalette(themePalette(this.colour())));
    // Switch live when the device changes light/dark (e.g. automatic at sunset).
    this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)')
      .addEventListener?.('change', (e) => this.dark.set(e.matches));
  }

  setColour(colour: ThemeColour): void {
    this.colour.set(colour);
    this.prefs.set(ThemeService.COLOUR_KEY, colour);
  }

  private validColour(value: string): ThemeColour {
    return THEME_COLOURS.some((c) => c.id === value) ? (value as ThemeColour) : DEFAULT_THEME_COLOUR;
  }

  private systemPrefersDark(): boolean {
    return this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
