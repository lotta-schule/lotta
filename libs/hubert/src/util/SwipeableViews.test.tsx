import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SwipeableViews } from './SwipeableViews';

import styles from './SwipeableViews.module.scss';

describe('SwipeableViews Component', () => {
  const mockOnChange = vi.fn<() => void>();

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
});
