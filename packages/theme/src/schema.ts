import { Theme } from './Theme';

export type CSSType = 'value' | 'number' | 'length' | 'color' | 'font-family';

export const schema: Record<
  keyof Theme,
  {
    type: CSSType;
    description: string;
  }
> = {
  primaryColor: {
    type: 'color',
    description: 'Primary color',
  },
  navigationBackgroundColor: {
    type: 'color',
    description: 'Navigation background color',
  },
  navigationContrastTextColor: {
    type: 'color',
    description: 'Color of the text on buttons in the main navigation',
  },
  errorColor: {
    type: 'color',
    description: 'Error color',
  },
  successColor: {
    type: 'color',
    description: 'Success color',
  },
  disabledColor: {
    type: 'color',
    description: 'Disabled color',
  },
  textColor: {
    type: 'color',
    description: 'Text color',
  },
  labelTextColor: {
    type: 'color',
    description: 'Label text color',
  },
  primaryContrastTextColor: {
    type: 'color',
    description: 'Contrast text color for the primaryBackgroundColor',
  },
  boxBackgroundColor: {
    type: 'color',
    description: 'Box background color',
  },
  pageBackgroundColor: {
    type: 'color',
    description: 'Page background color',
  },
  dividerColor: {
    type: 'color',
    description: 'Divider color',
  },
  highlightColor: {
    type: 'color',
    description: 'Highlight color',
  },
  bannerBackgroundColor: {
    type: 'color',
    description: 'Banner background color',
  },
  accentGreyColor: {
    type: 'color',
    description: 'Accent grey color',
  },
  spacing: {
    type: 'length',
    description: 'Spacing',
  },
  borderRadius: {
    type: 'length',
    description: 'Border radius',
  },
  textFontFamily: {
    type: 'font-family',
    description: 'font family for text',
  },
  titleFontFamily: {
    type: 'font-family',
    description: 'font family for titles',
  },
};
