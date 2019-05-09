import React from 'react';
import {
    render,
    cleanup
} from 'react-testing-library';
import { Link } from './Link';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';

afterEach(cleanup);

describe('component/general/Link', () => {
    it('should render a Link', () => {
        const { container } = render(<Router history={createBrowserHistory()}><Link to={'/bla'}>Bla</Link></Router>);
        const link = container.querySelector('a') as HTMLAnchorElement;
        expect(link.href).toMatch(/\/bla$/);
        expect(link).toHaveTextContent('Bla');
    });
});