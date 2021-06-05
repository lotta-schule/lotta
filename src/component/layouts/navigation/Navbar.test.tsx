import * as React from 'react';
import { MemoryHistory } from 'history';
import { FaecherCategory, FrancaisCategory } from 'test/fixtures/Tenant';
import { render, waitFor } from 'test/util';
import { Navbar } from './Navbar';

describe('component/layouts/navigation/Navbar', () => {
    it('should render without error', () => {
        render(<Navbar />, {}, {});
    });

    it('it should render the correct amount of main categories', async () => {
        const screen = render(<Navbar />);

        await waitFor(async () => {
            expect(screen.queryAllByRole('button')).toHaveLength(4);
        });
    });

    it('it should render the correct amount of main categories', async () => {
        const screen = render(
            <Navbar />,
            {},
            {
                defaultPathEntries: [`/c/${FaecherCategory.id}`],
            }
        );

        await waitFor(async () => {
            expect(screen.queryAllByRole('button')).toHaveLength(10);
        });
    });

    it('should scroll to active nav item', async () => {
        Element.prototype.scrollIntoView = jest.fn();

        let history: MemoryHistory;
        const changeLocationFn = jest.fn();
        const screen = render(
            <Navbar />,
            {},
            {
                defaultPathEntries: [`/c/${FaecherCategory.id}`],
                getHistory: (h) => (history = h),
                onChangeLocation: changeLocationFn,
            }
        );

        await waitFor(async () => {
            expect(history).not.toBeNull();
        });

        expect(screen.getByTestId('nav-level2')).toHaveProperty(
            'scrollLeft',
            0
        );

        history!.push(`/c/${FrancaisCategory.id}`);

        await waitFor(() => {
            expect(changeLocationFn).toHaveBeenCalled();
        });
        expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });
});
