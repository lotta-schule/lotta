import * as React from 'react';
import { render } from '../test-utils';
import { Tab } from './Tab';

describe('tabs/Tab', () => {
  it('should render a Tab button', () => {
    const screen = render(<Tab value={4}>Tab-Button</Tab>);
    expect(screen.getByRole('tab')).toMatchSnapshot();
  });

  it('should make a tab button selected', () => {
    const screen = render(
      <Tab selected value={4}>
        Tab-Button
      </Tab>
    );
    expect(screen.getByRole('tab', { selected: true })).toBeVisible();
  });
});
