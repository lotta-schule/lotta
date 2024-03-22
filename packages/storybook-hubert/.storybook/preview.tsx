import * as React from 'react';
import { Preview } from '@storybook/react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { DefaultThemes } from '@lotta-schule/theme';
import { MotionGlobalConfig } from 'framer-motion';
import { GlobalStyles, HubertProvider } from '@lotta-schule/hubert';
import isChromatic from 'chromatic';

import '@lotta-schule/hubert/dist/index.css';

if (isChromatic()) {
  MotionGlobalConfig.skipAnimations = true;
}

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
