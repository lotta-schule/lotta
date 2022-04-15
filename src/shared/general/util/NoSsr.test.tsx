import { renderToStaticMarkup } from 'react-dom/server';
import { render } from 'test/util';
import { NoSsr } from './NoSsr';

describe('NoSsr', () => {
    it('should not render children at init', () => {
        const html = renderToStaticMarkup(
            <NoSsr>
                <p>Hello</p>
            </NoSsr>
        );
        expect(html).toEqual('');
    });

    it('should render children after init', async () => {
        const screen = render(
            <NoSsr>
                <p>Hello</p>
            </NoSsr>
        );
        expect(await screen.findByText('Hello')).not.toBeNull();
    });
});
