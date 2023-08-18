import * as React from 'react';
import { Preview } from '@storybook/react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { DefaultThemes } from '@lotta-schule/theme';
import { HubertProvider } from '../src/HubertProvider';
import { GlobalStyles } from '../src/theme';

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const theme = {
        ...DefaultThemes.standard,
        ...context.globals.hubertTheme,
      };
      return (
        <HubertProvider>
          <GlobalStyles
            theme={theme}
            supportedFonts={[
              {
                name: 'Muli',
                url: 'https://fonts.googleapis.com/css2?family=Muli&display=swap',
              },
            ]}
          />
          {Story() as any}
        </HubertProvider>
      );
    },
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    viewport: {
      viewports: INITIAL_VIEWPORTS,
    },
  },
  globalTypes: {
    hubertTheme: {
      name: 'Theme',
      title: 'Hubert Theme',
      description: 'The theme for the Hubert components',
      defaultValue: DefaultThemes['standard'],
    },
  },
};

export default preview;
