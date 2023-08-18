import * as React from 'react';
import { Theme } from '@lotta-schule/theme';
import { CSSVariables } from './CSSVariables';
import { ExternalFont, FontLoader } from './FontLoader';

import './GlobalStyles.global.scss';

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
      </>
    );
  }
);
GlobalStyles.displayName = 'GlobalHubertStyles';
