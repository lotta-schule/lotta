import React from 'react';
import { render, cleanup } from 'test/util';
import { MockedProvider } from '@apollo/client/testing';
import { Footer } from './Footer';
import { apolloMocks } from 'test/mocks/apollo';

afterEach(cleanup);

describe('component/layouts/Footer', () => {

    it('should render all footer links', async done => {
        const { container } = render(
            <MockedProvider mocks={apolloMocks}>
                <Footer />
            </MockedProvider>
        );
        await new Promise(resolve => setTimeout(resolve));
        const links = container.querySelectorAll('a');
        expect(links.length).toBeGreaterThan(0);
        done();
    });

});