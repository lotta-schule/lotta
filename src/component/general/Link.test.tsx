import React from 'react';
import { cleanup, render } from 'test/util';
import { CollisionLink } from './CollisionLink';

afterEach(cleanup);

describe('component/general/Link', () => {
    it('should render a Link', () => {
        const { container } = render(<CollisionLink to={'/bla'}>Bla</CollisionLink>);
        const link = container.querySelector('a') as HTMLAnchorElement;
        expect(link.href).toMatch(/\/bla$/);
        expect(link).toHaveTextContent('Bla');
    });

    it('should style a link', () => {
        const { container } = render(<CollisionLink to={'/bla'} style={{ color: 'red' }}>Bla</CollisionLink>);
        const link = container.querySelector('a') as HTMLAnchorElement;
        expect(link).toHaveStyle('color: red');
    });
});