import * as React from 'react';
import { Preview } from '@storybook/react-vite';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import { MotionGlobalConfig } from 'framer-motion';
import {
  DefaultThemes,
  GlobalStyles,
  HubertProvider,
} from '@lotta-schule/hubert';
import isChromatic from 'chromatic';

if ((isChromatic as any)()) {
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
                url: 'https://fonts.googleapis.com/css2?family=Muli&display=block',
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
      options: INITIAL_VIEWPORTS,
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

  tags: ['autodocs'],
};

export default preview;
