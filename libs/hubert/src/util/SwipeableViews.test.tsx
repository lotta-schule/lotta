import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SwipeableViews } from './SwipeableViews';

import styles from './SwipeableViews.module.scss';

describe('SwipeableViews Component', () => {
  const mockOnChange = vi.fn();

  const mockChildren = [
    <div key="1">View 1</div>,
    <div key="2">View 2</div>,
    <div key="3">View 3</div>,
  ];

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const screen = render(
      <SwipeableViews selectedIndex={0} onChange={mockOnChange}>
        {mockChildren}
      </SwipeableViews>
    );

    const views = screen.container.getElementsByClassName(styles.viewElement);
    expect(views.length).toBe(mockChildren.length);
  });

  it('changes view when selectedIndex prop changes', async () => {
    const screen = render(
      <SwipeableViews selectedIndex={0} onChange={mockOnChange}>
        {mockChildren}
      </SwipeableViews>
    );

    await waitFor(() => {
      expect(screen.getByTestId('movingStrip')).toHaveStyle('left: 0px');
    });

    screen.rerender(
      <SwipeableViews selectedIndex={2} onChange={mockOnChange}>
        {mockChildren}
      </SwipeableViews>
    );

    await waitFor(() => {
      expect(
        parseInt(screen.getByTestId('movingStrip').style.left)
      ).toBeLessThan(-100);
    });
  });

  describe.skip('swiping', () => {
    it('changes view on swipe', async () => {
      /*
      const fireEvent = userEvent.setup();
      const screen = render(
        <SwipeableViews selectedIndex={0} onChange={mockOnChange}>
          {mockChildren}
        </SwipeableViews>
      );

      const movingStrip = getByTestId('movingStrip');

      const pointer = await drag(movingStrip).to(-250, 100); // + 1 + 2 = 3
      await frame.postRender(); // + 2 = 5
      await pointer.to(-500, 50); // + 2 = 7
      await frame.postRender(); // + 2 = 9
      pointer.end(); // + 3 = 12
      */

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(1);
      });
    });

    it('does not change view on small swipe offset', () => {
      /*
      const fireEvent = userEvent.setup();
      const screen = render(
        <SwipeableViews selectedIndex={1} onChange={mockOnChange}>
          {mockChildren}
        </SwipeableViews>
      );

      const movingStrip = screen.getByTestId('movingStrip');

      fireEvent.touchStart(movingStrip, {
        offset: { x: 10, y: 0 },
        velocity: { x: 100, y: 0 },
      });
      */

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('does not change view on small swipe velocity', () => {
      /*
      const fireEvent = userEvent.setup();
      const screen = render(
        <SwipeableViews selectedIndex={1} onChange={mockOnChange}>
          {mockChildren}
        </SwipeableViews>
      );

      const movingStrip = getByTestId('movingStrip');

      fireEvent.dragEnd(movingStrip, {
        offset: { x: 100, y: 0 },
        velocity: { x: 50, y: 0 },
      });
      */

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });
});
