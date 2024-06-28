import * as React from 'react';
import { render } from '@testing-library/react';
import { DefaultThemes } from '@lotta-schule/theme';
import { ExternalFont, FontLoader } from './FontLoader';

const theme = {
  ...DefaultThemes['standard'],
  textFontFamily: 'Muli',
  titleFontFamily: 'Schoolbell',
};

const supportedFonts: ExternalFont[] = [
  { name: 'Muli', url: '/muli' },
  { name: 'Schoolbell', url: '/schoolbell' },
  { name: 'Windings', url: '/windings' },
];

describe('FontLoader', () => {
  it('should render correct link-tags for font files found in the theme and the supportedFonts', () => {
    const screen = render(
      <FontLoader theme={theme} supportedFonts={supportedFonts} />
    );

    expect(
      screen.container.querySelector('link[href="/muli"]')
    ).toBeInTheDocument();
    expect(
      screen.container.querySelector('link[href="/schoolbell"]')
    ).toBeInTheDocument();
    expect(screen.container.querySelector('link[href="/windings"]')).toBeNull();
  });
});
