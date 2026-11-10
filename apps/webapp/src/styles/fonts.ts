import { fontMetadata } from './fonts.generated';

/**
 * The category decides which local system font is used (and size-adjusted)
 * as fallback while the web font is still loading:
 * 'serif' -> Times New Roman, 'sans-serif' -> Arial
 */
export type FontCategory = 'serif' | 'sans-serif';

export type FontDefinition = {
  /** The font-family name, as declared in the @font-face rules */
  name: string;
  /** The directory of the font in `src/styles/fonts` and `public/fonts` */
  directory: string;
  category: FontCategory;
};

export const headerFonts: FontDefinition[] = [
  { name: 'Schoolbell', directory: 'schoolbell', category: 'sans-serif' },
  {
    name: 'DM Serif Display',
    directory: 'dm-serif-display',
    category: 'serif',
  },
  { name: 'Roboto Slab', directory: 'roboto-slab', category: 'serif' },
  {
    name: 'Ubuntu Condensed',
    directory: 'ubuntu-condensed',
    category: 'sans-serif',
  },
  { name: 'Quicksand', directory: 'quicksand', category: 'sans-serif' },
  { name: 'Vollkorn', directory: 'vollkorn', category: 'serif' },
  {
    name: 'Patrick Hand SC',
    directory: 'patrick-hand-sc',
    category: 'sans-serif',
  },
  {
    name: 'Julius Sans One',
    directory: 'julius-sans-one',
    category: 'sans-serif',
  },
  { name: 'Oranienbaum', directory: 'oranienbaum', category: 'serif' },
  { name: 'Cormorant SC', directory: 'cormorant-sc', category: 'serif' },
  { name: 'Grandstander', directory: 'grandstander', category: 'sans-serif' },
];

export const textFonts: FontDefinition[] = [
  { name: 'Muli', directory: 'muli', category: 'sans-serif' },
  { name: 'Baloo 2', directory: 'balloo-2', category: 'sans-serif' },
  { name: 'Be Vietnam', directory: 'be-vietnam', category: 'sans-serif' },
  { name: 'IBM Plex Serif', directory: 'ibm-plex-serif', category: 'serif' },
  { name: 'Krub', directory: 'krub', category: 'sans-serif' },
  { name: 'Montserrat', directory: 'montserrat', category: 'sans-serif' },
  { name: 'Spectral', directory: 'spectral', category: 'serif' },
  { name: 'Nunito', directory: 'nunito', category: 'sans-serif' },
  { name: 'Inter', directory: 'inter', category: 'sans-serif' },
  { name: 'Teachers', directory: 'teachers', category: 'sans-serif' },
  { name: 'Assistant', directory: 'assistant', category: 'sans-serif' },
  {
    name: 'Ibarra Real Nova',
    directory: 'ibarra-real-nova',
    category: 'serif',
  },
  { name: 'Cormorant', directory: 'cormorant', category: 'serif' },
];

export const allFonts: FontDefinition[] = [...headerFonts, ...textFonts];

/**
 * Names that were offered at some point, but that do not match the
 * font-family of the @font-face rules. Tenants may still have them saved.
 */
const fontNameAliases: Record<string, string> = {
  'Balloo 2': 'Baloo 2',
};

const GENERIC_FAMILIES = [
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'math',
  'emoji',
  'fangsong',
];

const unquote = (name: string) =>
  name
    .trim()
    .replace(/^['"]+/, '')
    .replace(/['"]+$/, '')
    .trim();

const findFont = (name: string) =>
  allFonts.find((font) => font.name.toLowerCase() === name.toLowerCase());

/**
 * Normalizes a font name that may come from a saved tenant theme
 * (e.g. corrects known misspellings).
 */
export const normalizeFontName = (name: string) =>
  fontNameAliases[unquote(name)] ?? unquote(name);

/**
 * The first font of a CSS font-family value, e.g. for showing it as selected
 * in a font picker: `"'Schoolbell', cursive"` -> `'Schoolbell'`
 */
export const getPrimaryFontName = (fontFamily: string) =>
  parseFontFamily(fontFamily)[0] ?? fontFamily;

/**
 * Splits a CSS font-family value into its (unquoted, normalized) names
 */
export const parseFontFamily = (fontFamily: string) =>
  fontFamily
    .split(',')
    .map(normalizeFontName)
    .filter((name) => name.length > 0);

/**
 * Expands a font-family value from a theme so that every known web font
 * is followed by its size-adjusted local fallback, and that the stack ends
 * with a generic family. This avoids the browser falling back to its default
 * font (mostly Times New Roman) while the web font loads, and keeps the
 * layout from shifting when the web font is swapped in.
 *
 * @example
 * withFontFallbacks('Muli') // => '"Muli", "Muli Fallback", sans-serif'
 */
export const withFontFallbacks = (fontFamily: string) => {
  const names = parseFontFamily(fontFamily);
  const families: string[] = [];
  let genericFamily: string | null = null;

  for (const name of names) {
    if (GENERIC_FAMILIES.includes(name.toLowerCase())) {
      genericFamily ??= name.toLowerCase();
      continue;
    }
    const font = findFont(name);
    families.push(`"${font?.name ?? name}"`);
    if (font && fontMetadata[font.name]) {
      families.push(`"${font.name} Fallback"`);
    }
  }

  const firstKnownFont = names.map(findFont).find(Boolean);
  families.push(genericFamily ?? firstKnownFont?.category ?? 'sans-serif');

  return families.join(', ');
};

/**
 * Returns the URLs of the font files which should be preloaded so the
 * given font-family value renders without (or with very little) delay.
 * This is one file per known web font: the latin subset of the regular,
 * non-italic face.
 */
export const getFontPreloadUrls = (fontFamily: string) =>
  parseFontFamily(fontFamily)
    .map(findFont)
    .map((font) => font && fontMetadata[font.name]?.preload)
    .filter((url): url is string => !!url);

/**
 * The theme keys holding a font-family value
 * (see the `font-family` type in the theme schema)
 */
const THEME_FONT_FAMILY_KEYS = ['textFontFamily', 'titleFontFamily'] as const;

/**
 * Returns a copy of the theme in which every font-family value is expanded
 * with the local fallbacks (see `withFontFallbacks`).
 */
export const withThemeFontFallbacks = <T extends Record<string, any>>(
  theme: T
): T => {
  const result: Record<string, any> = { ...theme };
  for (const key of THEME_FONT_FAMILY_KEYS) {
    if (typeof result[key] === 'string' && result[key].trim()) {
      result[key] = withFontFallbacks(result[key]);
    }
  }
  return result as T;
};

/**
 * The font files to preload for the font-families used by the theme
 */
export const getThemeFontPreloadUrls = (theme: Record<string, any>) => [
  ...new Set(
    THEME_FONT_FAMILY_KEYS.flatMap((key) =>
      typeof theme[key] === 'string' ? getFontPreloadUrls(theme[key]) : []
    )
  ),
];
