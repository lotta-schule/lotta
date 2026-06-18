import * as React from 'react';
import { render, userEvent } from '../test-utils';
import { Tab } from './Tab';
import { Tabbar } from './Tabbar';

describe('tabs/Tabbar', () => {
  it('snapshot test', () => {
    const screen = render(
      <Tabbar value={'3'} onChange={vi.fn}>
        <Tab value={'0'}>Tab1 bla bla bla</Tab>
        <Tab value={'1'}>Tab2</Tab>
        <Tab value={'2'}>Tab3</Tab>
        <Tab value={'3'}>Tab4 dingsi bumso</Tab>
        <Tab value={'4'}>Tab5</Tab>
      </Tabbar>
    );
    expect(screen.getByRole('tablist')).toMatchSnapshot();
  });

  it('should have the correct tab selected', () => {
    const screen = render(
      <Tabbar value={'2'} onChange={vi.fn}>
        <Tab value={'0'}>Tab1 bla bla bla</Tab>
        <Tab value={'1'}>Tab2</Tab>
        <Tab value={'2'}>Tab3</Tab>
        <Tab value={'3'}>Tab4 dingsi bumso</Tab>
        <Tab value={'4'}>Tab5</Tab>
      </Tabbar>
    );
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'Tab3'
    );
  });

  it('should call onChange with the correct value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const screen = render(
      <Tabbar value={'2'} onChange={onChange}>
        <Tab value={'0'}>Tab1 bla bla bla</Tab>
        <Tab value={'1'}>Tab2</Tab>
        <Tab value={'2'}>Tab3</Tab>
        <Tab value={'3'}>Tab4 dingsi bumso</Tab>
        <Tab value={'4'}>Tab5</Tab>
      </Tabbar>
    );

    await user.click(screen.getByRole('tab', { name: 'Tab5' }));
    expect(onChange).toHaveBeenCalledWith('4');
  });
});
