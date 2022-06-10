import { render } from 'test/util';
import { Avatar } from '../avatar/Avatar';
import { Button } from '../button/Button';
import { List, ListItem } from './List';

describe('List', () => {
    it('should render', () => {
        const screen = render(
            <List>
                <ListItem>Test</ListItem>
                <ListItem>Test</ListItem>
                <ListItem>Test</ListItem>
                <ListItem>Test</ListItem>
            </List>
        );
        expect(screen.container).toMatchSnapshot();
    });

    it('should render with subsection left', () => {
        const screen = render(
            <List>
                <ListItem leftSection={<Avatar src={''} />}>Test</ListItem>
                <ListItem leftSection={<Avatar src={''} />}>Test</ListItem>
                <ListItem leftSection={<Avatar src={''} />}>Test</ListItem>
                <ListItem leftSection={<Avatar src={''} />}>Test</ListItem>
            </List>
        );
        expect(screen.container).toMatchSnapshot();
    });

    it('should render with subsection right', () => {
        const screen = render(
            <List>
                <ListItem
                    leftSection={<Avatar src={''} />}
                    rightSection={<Button>Test</Button>}
                >
                    Test
                </ListItem>
                <ListItem rightSection={<Button>Test</Button>}>Test</ListItem>
                <ListItem rightSection={<Button>Test</Button>}>Test</ListItem>
                <ListItem rightSection={<Button>Test</Button>}>Test</ListItem>
            </List>
        );
        expect(screen.container).toMatchSnapshot();
    });
});
