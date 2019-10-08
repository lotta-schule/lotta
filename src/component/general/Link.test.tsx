import React from 'react';
import {
    render,
    cleanup
} from '@testing-library/react';
import { CollisionLink } from './CollisionLink';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';

afterEach(cleanup);

describe('component/general/Link', () => {
    it('should render a Link', () => {
        const { container } = render(<Router history={createBrowserHistory()}><CollisionLink to={'/bla'}>Bla</CollisionLink></Router>);
        const link = container.querySelector('a') as HTMLAnchorElement;
        expect(link.href).toMatch(/\/bla$/);
        expect(link).toHaveTextContent('Bla');
    });

    it('should style a link', () => {
        const { container } = render(<Router history={createBrowserHistory()}><CollisionLink to={'/bla'} style={{ color: 'red' }}>Bla</CollisionLink></Router>);
        const link = container.querySelector('a') as HTMLAnchorElement;
        expect(link).toHaveStyle('color: red');
    });
});