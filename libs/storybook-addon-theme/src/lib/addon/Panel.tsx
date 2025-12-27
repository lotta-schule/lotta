import React from 'react';
import { useGlobals } from 'storybook/manager-api';
import { AddonPanel } from 'storybook/internal/components';
import { PureArgsTable } from '@storybook/addon-docs/blocks';
import { styled } from 'storybook/theming';
import { DefaultThemes, schema } from '@lotta-schule/theme';
import { generateArgsTableRows } from '../../util';

export const Panel = ({ active, key }: any) => {
  const StyledHeader = styled.h2`
    padding: ${({ theme }) => theme.layoutMargin}px;
    font-size: ${({ theme }) => theme.typography.size.l2};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
  `;

  const [globals, updateGlobals] = useGlobals();
  const themeName = 'standard';

  const theme = {
    ...DefaultThemes[themeName],
    ...globals.hubertTheme,
  };

  const updateTheme = (updated: Record<string, any>) => {
    updateGlobals({
      hubertTheme: {
        ...globals.hubertTheme,
        ...updated,
      },
    });
  };

  const rows = generateArgsTableRows(schema);

  return (
    <AddonPanel active={!!active} key={key}>
      <div>
        <StyledHeader>Edit the current theme</StyledHeader>
        <PureArgsTable
          rows={rows}
          args={theme}
          updateArgs={(args: Record<string, unknown>) => {
            updateTheme(args);
          }}
        />
      </div>
    </AddonPanel>
  );
};
