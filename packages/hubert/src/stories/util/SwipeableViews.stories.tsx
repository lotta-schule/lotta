import * as React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { SwipeableViews } from '../../util/SwipeableViews';
import { Button } from '../../button';

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
  },
} as Meta<typeof SwipeableViews>;

export const Default: StoryObj<typeof SwipeableViews> = {
  render: ({ selectedIndex }) => {
    const [index, setIndex] = React.useState(selectedIndex);
    React.useEffect(() => {
      setIndex(selectedIndex);
    }, [selectedIndex]);
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
          <Button onClick={() => setIndex(index - 1)} disabled={index === 0}>
            previous
          </Button>
          <Button
            onClick={() => setIndex(index + 1)}
            disabled={index === images.length - 1}
          >
            next
          </Button>
        </nav>
        <SwipeableViews selectedIndex={index} onChange={setIndex}>
          {images.map((image, i) => (
            <img key={i} src={image} style={{ width: '100%' }} />
          ))}
        </SwipeableViews>
      </div>
    );
  },
  args: {
    selectedIndex: 0,
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
