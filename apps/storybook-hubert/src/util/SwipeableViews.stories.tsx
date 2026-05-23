import * as React from 'react';
import { StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { expect, fireEvent, fn, waitFor, within } from 'storybook/test';
import {
  Button,
  SwipeableViews,
  SwipeableViewsProps,
} from '@lotta-schule/hubert';

export default {
  title: 'util/SwipeableViews',
  component: SwipeableViews,
  argTypes: {
    selectedIndex: {
      control: {
        type: 'number',
        min: 0,
        max: 5,
      },
    },
    onChange: fn(),
  },
};

export const Default: StoryObj<typeof SwipeableViews> = {
  render: ({ selectedIndex }) => {
    const [args, updateArgs] = useArgs<SwipeableViewsProps>();

    const images = [
      'https://picsum.photos/id/3/1000/600',
      'https://picsum.photos/id/6/1000/600',
      'https://picsum.photos/id/9/1000/600',
      'https://picsum.photos/id/12/1000/600',
      'https://picsum.photos/id/15/1000/600',
      'https://picsum.photos/id/18/1000/600',
    ];

    return (
      <div>
        <nav
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            padding: 'var(--lotta-spacing) 0',
          }}
        >
          <Button
            onClick={() => updateArgs({ selectedIndex: selectedIndex - 1 })}
            disabled={selectedIndex <= 0}
          >
            previous
          </Button>
          <Button
            onClick={() => updateArgs({ selectedIndex: selectedIndex + 1 })}
            disabled={selectedIndex >= images.length}
          >
            next
          </Button>
        </nav>
        <SwipeableViews
          {...args}
          onChange={(selectedIndex) => updateArgs({ selectedIndex })}
        >
          {images.map((image, i) => (
            <img
              alt={'Have fun and swipe!'}
              key={i}
              src={image}
              style={{ width: '100%' }}
            />
          ))}
        </SwipeableViews>
      </div>
    );
  },
  args: {
    selectedIndex: 0,
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    const nextButton = screen.getByRole('button', { name: 'next' });
    const previousButton = screen.getByRole('button', { name: 'previous' });
    const swipeableViews = screen.getByTestId('movingStrip');

    expect(swipeableViews).toHaveStyle('left: 0px');

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(swipeableViews).not.toHaveStyle('left: 0px');
    });

    await new Promise((reslve) => setTimeout(reslve, 500));
    fireEvent.click(previousButton);

    await waitFor(() => {
      expect(swipeableViews).toHaveStyle('left: 0px');
    });
  },
};
