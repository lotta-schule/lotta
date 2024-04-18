import * as React from 'react';
import { Theme } from '@lotta-schule/theme';
import { CSSVariables } from './CSSVariables';
import { ExternalFont, FontLoader } from './FontLoader';

export type GlobalStylesProps = {
  theme: Theme;
  supportedFonts?: ExternalFont[];
};

export const GlobalStyles = React.memo(
  ({ theme, supportedFonts = [] }: GlobalStylesProps) => {
    return (
      <>
        <CSSVariables theme={theme} />
        <FontLoader theme={theme} supportedFonts={supportedFonts} />
        <style data-hubert-global-styles>{`
            * {
                box-sizing: border-box;
            }

            html,
            body {
                margin: 0;
                font-family: var(--lotta-text-font-family);

            }

            body {
                margin: 0 auto;

            }
            body::after {
                content: "";
                position: fixed;
                top: 0;
                height: 100vh; /* fix for mobile browser address bar appearing disappearing */
                left: 0;
                right: 0;
                z-index: -1;
                background-color: rgba(var(--lotta-page-background-color), 1);
                background-attachment: scroll;
                background-size: cover;
            }

            ul {
                padding: 0;
                margin: 0;
                list-style: none;
            }

            a {
                color: inherit;
                text-decoration: inherit;
            }

            figure {
                margin: 0;
            }

            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
                margin-block-start: 0;
                margin-block-end: calc(0.5 * var(--lotta-spacing));
            }

            h1 {
                font-size: 2em;
            }
            h2 {
                font-size: 1.5em;
            }
            h3 {
                font-size: 1.25em;
            }
            h4 {
                font-size: 1.2em;
            }
            h5,
            h6 {
                font-size: 1em;
            }

            fieldset {
                border: none;
                padding: 0;
            }

            @media print {
              html, body {
                font-size: 8pt;
              }
            }
        `}</style>
      </>
    );
  }
);
GlobalStyles.displayName = 'GlobalHubertStyles';
