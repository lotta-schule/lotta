import userEvent from '@testing-library/user-event';
import { render } from 'test/util';
import { Tab } from './Tab';
import { Tabbar } from './Tabbar';

describe('tabs/Tabbar', () => {
    it('snapshot test', () => {
        const screen = render(
            <Tabbar value={'3'} onChange={jest.fn}>
                <Tab value={'0'}>Tab1 bla bla bla</Tab>
                <Tab value={'1'}>Tab2</Tab>
                <Tab value={'2'}>Tab3</Tab>
                <Tab value={'3'}>Tab4 dingsi bumso</Tab>
                <Tab value={'4'}>Tab5</Tab>
            </Tabbar>
        );
        expect(screen.container).toMatchSnapshot();
    });

    it('should have the correct tab selected', () => {
        const screen = render(
            <Tabbar value={'2'} onChange={jest.fn}>
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

    it('should call onChange with the correct value', () => {
        const onChange = jest.fn();
        const screen = render(
            <Tabbar value={'2'} onChange={onChange}>
                <Tab value={'0'}>Tab1 bla bla bla</Tab>
                <Tab value={'1'}>Tab2</Tab>
                <Tab value={'2'}>Tab3</Tab>
                <Tab value={'3'}>Tab4 dingsi bumso</Tab>
                <Tab value={'4'}>Tab5</Tab>
            </Tabbar>
        );
        userEvent.click(screen.getByRole('tab', { name: 'Tab5' }));
        expect(onChange).toHaveBeenCalledWith('4');
    });
});
