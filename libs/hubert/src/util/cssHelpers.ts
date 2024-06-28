import { type CSSType } from '@lotta-schule/theme';
import Color from 'colorjs.io';

export const toCSSVariableName = (camelCaseString: string) => {
  const kebabCased = camelCaseString.replace(
    /[A-Z]/g,
    (match) => '-' + match.toLowerCase()
  );
  return '--lotta-' + kebabCased;
};

export const toCSSVariableValue = (
  originalValue: string | number,
  propertyDescription?: CSSType
): string => {
  if (typeof originalValue === 'number') {
    return propertyDescription === 'length'
      ? `${originalValue}px`
      : `${originalValue}`;
  }
  try {
    const color = new Color(originalValue);
    const { r, g, b } = color.srgb;
    return [r, g, b].map((c) => (c * 255).toFixed(0)).join(', ');
  } catch (e) {
    return originalValue;
  }
};
