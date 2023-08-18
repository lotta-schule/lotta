import { Theme } from '@lotta-schule/theme';
import * as React from 'react';
import { toCSSVariableName, toCSSVariableValue } from '../util';

export type CSSVariablesProps = {
  theme: Theme;
};

export const CSSVariables = React.memo(({ theme }: CSSVariablesProps) => {
  const cssVarsInit = Object.entries(theme)
    .map(
      ([key, val]) =>
        `    ${toCSSVariableName(key)}: ${toCSSVariableValue(val)};`
    )
    .join('\n');

  const cssContent = ':root {\n' + cssVarsInit + '\n}';

  return <style dangerouslySetInnerHTML={{ __html: cssContent }} />;
});
CSSVariables.displayName = 'CSSVariables';
