import { type CSSType } from '@lotta-schule/theme';
import Color from 'colorjs.io';

export const toCSSVariableName = (camelCaseString: string) => {
  const kebabCased = camelCaseString.replace(
    /[A-Z]/g,
    (match) => '-' + match.toLowerCase()
  );
  return '--lotta-' + kebabCased;
};

const GENERIC_FONT_FAMILIES = [
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

/**
 * Makes sure a font-family value ends with a generic font family.
 * Without one, the browser uses its default font (mostly Times New Roman)
 * while a web font is loading or when it is not available.
 */
export const withGenericFontFamily = (
  fontFamily: string,
  genericFontFamily = 'sans-serif'
) => {
  const hasGenericFamily = fontFamily
    .split(',')
    .map((name) => name.trim().toLowerCase())
    .some((name) => GENERIC_FONT_FAMILIES.includes(name));
  if (hasGenericFamily || !fontFamily.trim()) {
    return fontFamily;
  }
  return `${fontFamily}, ${genericFontFamily}`;
};

export const toCSSVariableValue = (
  originalValue: string | number,
  propertyDescription?: CSSType
): string => {
  if (
    propertyDescription === 'font-family' &&
    typeof originalValue === 'string'
  ) {
    return withGenericFontFamily(originalValue);
  }
  if (typeof originalValue === 'number') {
    return propertyDescription === 'length'
      ? `${originalValue}px`
      : `${originalValue}`;
  }
  try {
    const color = new Color(originalValue);
    const [r, g, b] = color.to('srgb').coords.map((c) => c || 0);
    return [r, g, b].map((c) => (c * 255).toFixed(0)).join(', ');
  } catch {
    return originalValue;
  }
};
