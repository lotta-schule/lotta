import { render } from 'test/util';
import { Menu } from './Menu';
import { MenuItem, MenuList } from './MenuList';
import userEvent from '@testing-library/user-event';

describe('Menu', () => {
    it('should render a Menu button', async () => {
        const screen = render(
            <Menu buttonProps={{ label: 'Click' }}>
                <MenuList>
                    <MenuItem>A</MenuItem>
                    <MenuItem>B</MenuItem>
                    <MenuItem>C</MenuItem>
                </MenuList>
            </Menu>
        );
        expect(screen.getByRole('button')).toHaveTextContent('Click');
        userEvent.click(screen.getByRole('button'));
        expect(await screen.findByRole('menu')).toBeVisible();
    });
});
