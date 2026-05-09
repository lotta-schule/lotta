import * as React from 'react';
import { StoryObj } from '@storybook/react-vite';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import { action } from 'storybook/actions';
import {
  SplitView,
  SplitViewNavigation,
  SplitViewContent,
  SplitViewButton,
  List,
  ListItem,
  Toolbar,
  Close,
  ExpandMore,
} from '@lotta-schule/hubert';
import { expect, fireEvent, waitFor, within } from 'storybook/test';

export default {
  title: 'Layout/SplitView',
  component: SplitView,
  argTypes: {},

  parameters: {
    viewport: {
      viewports: INITIAL_VIEWPORTS,
    },
    chromatic: {
      delay: 500,
      viewports: [500],
    },
  },

  globals: {
    viewport: {
      value: 'iphone14',
      isRotated: false,
    },
  },
};

type Story = StoryObj<typeof SplitView>;

export const Default: Story = {
  args: {
    children: ({ close }) => (
      <>
        <SplitViewNavigation>
          <Toolbar style={{ justifyContent: 'flex-end' }}>
            <SplitViewButton action="close" icon={<Close />} />
          </Toolbar>
          <List>
            {Array.from({ length: 5 }, (_, i) => (
              <ListItem
                key={i}
                onClick={() => {
                  action(`Item ${i} clicked`);
                  close();
                }}
              >
                Item {i}
              </ListItem>
            ))}
          </List>
        </SplitViewNavigation>
        <SplitViewContent>
          <Toolbar>
            <SplitViewButton action="open" icon={<ExpandMore />} />
          </Toolbar>
          <img src="https://picsum.photos/id/3/300/200" alt="" />
        </SplitViewContent>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    await new Promise((resolve) => setTimeout(resolve, 500)); // wait for useEffect to run

    const closeButton = screen.getByRole('button', {
      name: /schließen/,
    });
    await expect(closeButton).toBeVisible();

    fireEvent.click(closeButton);

    await waitFor(async () => {
      await expect(
        screen.getByRole('button', {
          name: /öffnen/,
        })
      ).toBeVisible();
    });

    const openButton = screen.getByRole('button', {
      name: /öffnen/,
    });
    fireEvent.click(openButton);

    await waitFor(async () => {
      expect(openButton).not.toBeVisible();
      await expect(
        screen.getByRole('button', {
          name: /schließen/,
        })
      ).toBeVisible();
    });
  },
};
