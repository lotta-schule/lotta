import * as React from 'react';
import { Router } from 'next/router';
import { FaecherCategory, FrancaisCategory } from 'test/fixtures/Tenant';
import { render, waitFor } from 'test/util';
import { Navbar } from './Navbar';

describe('shared/layouts/navigation/Navbar', () => {
    it('should render without error', () => {
        render(<Navbar />, {}, {});
    });

    it('it should render the correct amount of main categories', async () => {
        const screen = render(<Navbar />);

        await waitFor(async () => {
            expect(
                screen
                    .queryAllByRole('button')
                    .filter(
                        (button) =>
                            button.getAttribute('data-testid') !==
                            'MobileMenuButton'
                    )
            ).toHaveLength(4);
        });
    });

    it('it should render the correct amount of subcategories categories', async () => {
        const screen = render(
            <Navbar />,
            {},
            { router: { as: `/c/${FaecherCategory.id}` } }
        );

        await waitFor(async () => {
            expect(
                screen
                    .queryAllByRole('button')
                    .filter(
                        (button) =>
                            button.getAttribute('data-testid') !==
                            'MobileMenuButton'
                    )
            ).toHaveLength(10);
        });
    });

    // Problems mocking scrollIntoView
    it('should scroll to active nav item', async () => {
        let router: Router;
        const onPushLocation = jest.fn();
        const screen = render(
            <Navbar />,
            {},
            {
                router: {
                    as: `/c/${FaecherCategory.id}`,
                    onPush: onPushLocation,
                    getInstance: (_router: Router) => (router = _router),
                },
            }
        );

        await waitFor(() => {
            expect(screen.getByTestId('nav-level2')).toHaveProperty(
                'scrollLeft',
                0
            );
        });

        await router!.push(`/c/${FrancaisCategory.id}`);

        await waitFor(() => {
            expect(onPushLocation).toHaveBeenCalled();
        });
        expect(Element.prototype.scroll).toHaveBeenCalled();
    });
});
