import * as React from 'react';
import { render } from 'test/util';
import { CalendarKlassenarbeiten, CalendarResponse } from 'test/fixtures';
import { Calendar } from './Calendar';
import GetCalendarQuery from 'api/query/GetCalendarQuery.graphql';

describe('shared/widgets/Calendar', () => {
    const mocks = [
        {
            request: {
                query: GetCalendarQuery,
                variables: { url: 'http://calendar', days: 14 },
            },
            result: { data: CalendarResponse },
        },
    ];

    it('should render the schedule without error', () => {
        render(<Calendar widget={CalendarKlassenarbeiten} />);
    });

    describe('single calendar', () => {
        it('should show the correct number of entries', async () => {
            const screen = render(
                <Calendar widget={CalendarKlassenarbeiten} />,
                {},
                { additionalMocks: mocks }
            );
            expect(await screen.findAllByRole('listitem')).toHaveLength(18);
        });

        it('should show the correct date and time for single-day event', async () => {
            const screen = render(
                <Calendar widget={CalendarKlassenarbeiten} />,
                {},
                { additionalMocks: mocks }
            );
            expect(await screen.findAllByRole('listitem')).not.toHaveLength(0);
            const row = screen.getByRole('listitem', {
                name: /berufsorientierung/i,
            });
            expect(row).toBeVisible();
            expect(row).toHaveTextContent(/18.03.2021/);
            expect(row).toHaveTextContent(/9:30 - 11:00/);
        });

        it('should show the correct date for multi-day event', async () => {
            const screen = render(
                <Calendar widget={CalendarKlassenarbeiten} />,
                {},
                { additionalMocks: mocks }
            );
            expect(await screen.findAllByRole('listitem')).not.toHaveLength(0);
            const row = screen.getAllByRole('listitem', {
                name: /b-woche/i,
            })[0];
            expect(row).toBeVisible();
            expect(row).toHaveTextContent(/18.01.2021 - 23.01.2021/);
        });

        it('should show the correct description', async () => {
            const screen = render(
                <Calendar widget={CalendarKlassenarbeiten} />,
                {},
                { additionalMocks: mocks }
            );
            expect(await screen.findByText(/Raum E 10/)).toBeVisible();
        });
    });

    describe('multple calendar', () => {
        const CalendarWidgetMultiple = {
            ...CalendarKlassenarbeiten,
            configuration: {
                ...CalendarKlassenarbeiten.configuration,
                calendars: [
                    ...CalendarKlassenarbeiten.configuration!.calendars!,
                    {
                        url: 'http://calendar',
                        color: 'green',
                        name: 'Kalender 2',
                        days: 14,
                    },
                ],
            },
        };

        it('should show the correct number of entries', async () => {
            const screen = render(
                <Calendar widget={CalendarWidgetMultiple} />,
                {},
                { additionalMocks: mocks }
            );
            expect(await screen.findAllByRole('listitem')).toHaveLength(36);
        });

        it('should show a legend with calendar names and colors', async () => {
            const screen = render(
                <Calendar widget={CalendarWidgetMultiple} />,
                {},
                { additionalMocks: mocks }
            );
            expect(await screen.findAllByRole('listitem')).not.toHaveLength(0);
            expect(
                screen.getByRole('figure', { name: 'Legende: Kalender' })
            ).toBeVisible();
            expect(
                screen
                    .getByRole('figure', { name: 'Legende: Kalender' })
                    .querySelector<SVGElement>('svg')
            ).toHaveStyle({ color: 'red' });
            expect(
                screen.getByRole('figure', { name: 'Legende: Kalender 2' })
            ).toBeVisible();
            expect(
                screen
                    .getByRole('figure', { name: 'Legende: Kalender 2' })
                    .querySelector<SVGElement>('svg')
            ).toHaveStyle({ color: 'green' });
        });
    });
});
