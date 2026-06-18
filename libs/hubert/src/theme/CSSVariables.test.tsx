import * as React from 'react';
import { CSSVariables } from './CSSVariables';
import { render } from '@testing-library/react';
import { DefaultThemes } from '@lotta-schule/theme';

describe('CSSVariables', () => {
  it('should output the correct css variable definitions for the default theme', () => {
    const screen = render(<CSSVariables theme={DefaultThemes['standard']} />);
    expect(screen.container.querySelector('style')).toMatchSnapshot();
  });
});
