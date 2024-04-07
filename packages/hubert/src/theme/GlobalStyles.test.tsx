import * as React from 'react';
import { DefaultThemes } from '@lotta-schule/theme';
import { render } from '../test-utils';
import { GlobalStyles } from './GlobalStyles';

describe('GlobalStyles', () => {
  it('smoke test', () => {
    const screen = render(
      <GlobalStyles
        theme={DefaultThemes['standard']}
        supportedFonts={[{ name: 'Muli', url: '/this/is/muli.css' }]}
      />
    );

    expect(screen.container.querySelector('style')).toBeInTheDocument();
    expect(screen.container.querySelectorAll('link')).toHaveLength(-1);
  });
});
