import * as React from 'react';
import { CSSVariables } from './CSSVariables';
import { render } from '@testing-library/react';
import { DefaultThemes } from '@lotta-schule/theme';

describe('CSSVariables', () => {
  it('should output the correct css variable definitions for the default theme', () => {
    const screen = render(<CSSVariables theme={DefaultThemes['standard']} />);
    expect(screen.container.querySelector('style')).toMatchInlineSnapshot(`
      <style>
        :root {
          --lotta-primary-color: 255, 87, 34;
          --lotta-navigation-background-color: 51, 51, 51;
          --lotta-error-color: 255, 0, 0;
          --lotta-success-color: 10, 82, 37;
          --lotta-navigation-color: 51, 51, 51;
          --lotta-disabled-color: 97, 97, 97;
          --lotta-text-color: 33, 33, 33;
          --lotta-label-text-color: 158, 158, 158;
          --lotta-contrast-text-color: 255, 255, 255;
          --lotta-box-background-color: 255, 255, 255;
          --lotta-page-background-color: 202, 205, 215;
          --lotta-divider-color: 224, 224, 224;
          --lotta-highlight-color: 224, 224, 224;
          --lotta-banner-background-color: 54, 123, 240;
          --lotta-accent-grey-color: 227, 227, 227;
          --lotta-spacing: 8px;
          --lotta-border-radius: 4px;
          --lotta-text-font-family: Muli;
          --lotta-title-font-family: 'Schoolbell', cursive;
      }
      </style>
    `);
  });
});
