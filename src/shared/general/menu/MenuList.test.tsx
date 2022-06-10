import { render } from 'test/util';
import { Menu } from './Menu';
import { MenuItem, MenuList } from './MenuList';
import userEvent from '@testing-library/user-event';

describe('MenuList', () => {
    it('should render a MenuList', async () => {
        const click = jest.fn();
        const screen = render(
            <Menu buttonProps={{ label: 'Click' }}>
                <MenuList>
                    <MenuItem href={'/a'}>A</MenuItem>
                    <MenuItem isDivider />
                    <MenuItem onClick={click}>C</MenuItem>
                </MenuList>
            </Menu>
        );
        userEvent.click(screen.getByRole('button'));
        const listItems = screen.getAllByRole('menuitem');
        expect(listItems).toHaveLength(3);
        expect(listItems[0].nodeName).toEqual('A');
        expect(listItems[0]).toHaveTextContent('A');
        expect(listItems[1].nodeName).toEqual('LI');
        expect(listItems[2].nodeName).toEqual('LI');
        expect(listItems[2]).toHaveTextContent('C');
        userEvent.click(listItems[2]);
        expect(click).toHaveBeenCalled();
    });
});
