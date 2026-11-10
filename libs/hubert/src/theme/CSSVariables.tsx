import { Theme, schema } from '@lotta-schule/theme';
import * as React from 'react';
import { toCSSVariableName, toCSSVariableValue } from '../util';

export type CSSVariablesProps = {
  theme: Theme;
  rootSelector?: string;
};

export const CSSVariables = React.memo(
  ({ theme, rootSelector = ':root' }: CSSVariablesProps) => {
    const cssVarsInit = Object.entries(theme)
      .map(
        ([key, val]) =>
          `    ${toCSSVariableName(key)}: ${toCSSVariableValue(
            val,
            // only font-families get their type: lengths and numbers are
            // used unitless in the stylesheets
            schema[key as keyof Theme]?.type === 'font-family'
              ? 'font-family'
              : undefined
          )};`
      )
      .join('\n');

    const cssContent = rootSelector + ' {\n' + cssVarsInit + '\n}';

    return (
      <style
        data-hubert-css-variables-def
        dangerouslySetInnerHTML={{ __html: cssContent }}
      />
    );
  }
);
CSSVariables.displayName = 'CSSVariables';
