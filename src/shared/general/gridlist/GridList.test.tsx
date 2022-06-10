import { render } from 'test/util';
import { GridList, GridListItem } from './GridList';

describe('GridList', () => {
    it('should render a GridList', () => {
        const screen = render(
            <GridList>
                <GridListItem>
                    <img src="https://picsum.photos/600/400" alt="" />
                </GridListItem>
                <GridListItem>
                    <img src="https://picsum.photos/600/400" alt="" />
                </GridListItem>
                <GridListItem>
                    <img src="https://picsum.photos/600/400" alt="" />
                </GridListItem>
                <GridListItem>
                    <img src="https://picsum.photos/600/400" alt="" />
                </GridListItem>
                <GridListItem>
                    <img src="https://picsum.photos/600/400" alt="" />
                </GridListItem>
            </GridList>
        );

        expect(screen.container).toMatchSnapshot();
    });
});
