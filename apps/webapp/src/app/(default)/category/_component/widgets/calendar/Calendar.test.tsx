import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'test/util';
import { CalendarKlassenarbeiten, CalendarResponse } from 'test/fixtures';
import { Calendar, GET_EXTERNAL_CALENDAR_EVENTS } from './Calendar';

describe('shared/widgets/Calendar', () => {
  const mocks = [
    {
      request: {
        query: GET_EXTERNAL_CALENDAR_EVENTS,
        variables: { url: 'http://calendar', days: 14 },
      },
      result: { data: CalendarResponse },
    },
  ];

  beforeAll(() => {
    expect(new Date(2024, 8, 1).getTimezoneOffset()).toEqual(-120);
  });

  describe('calendar with external events', () => {
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

  describe('calendar with internal events', () => {
    const CalendarWidgetInternalEvents = {
      ...CalendarKlassenarbeiten,
      configuration: {
        ...CalendarKlassenarbeiten.configuration,
        calendars: [
          {
            type: 'internal',
            calendarId: '1',
            color: 'yellow',
            name: 'Interner Kalender',
            days: 14,
          } as const,
        ],
      },
      calendarEvents: [
        {
          id: '1-1',
          start:
            'Thu Apr 15 2021 08:30:00 GMT+0200 (Central European Summer Time)',
          end: 'Sun Apr 18 2021 23:59:59 GMT+0200 (Central European Summer Time)',
          summary: 'Berufsorientierung',
          description: 'Raum E 10',
          isFullDay: true,
          calendar: { id: '1' },
          recurrence: null,
        },
        {
          id: '1-2',
          start:
            'Sun Apr 18 2021 00:00:00 GMT+0200 (Central European Summer Time)',
          end: 'Sun Apr 18 2021 23:59:59 GMT+0200 (Central European Summer Time)',
          summary: 'Stichtag',
          description: null,
          isFullDay: true,
          calendar: { id: '1' },
          recurrence: null,
        },
        {
          id: '1-3',
          start:
            'Sun Apr 18 2021 11:30:00 GMT+0200 (Central European Summer Time)',
          end: 'Sun Apr 18 2021 13:00:00 GMT+0200 (Central European Summer Time)',
          summary: 'Mittag',
          description: null,
          isFullDay: false,
          calendar: { id: '1' },
          recurrence: null,
        },
      ],
    };
    it('should show the correct number of entries', async () => {
      const screen = render(
        <Calendar widget={CalendarWidgetInternalEvents} />,
        {},
        { additionalMocks: mocks }
      );
      expect(await screen.findAllByRole('listitem')).toHaveLength(3 + 1);
    });

    it('should show the correct date and time for single-day event', async () => {
      const screen = render(
        <Calendar widget={CalendarWidgetInternalEvents} />,
        {},
        { additionalMocks: mocks }
      );
      expect(await screen.findAllByRole('listitem')).not.toHaveLength(0);
      const row = screen.getByRole('listitem', {
        name: /mittag/i,
      });
      expect(row).toBeVisible();
      expect(row).toHaveTextContent(/18.04.2021/);
      expect(row.querySelector('time')).toHaveTextContent(/11:30 - 13:00/);
    });

    it('should show the correct date without time for a full-day event', async () => {
      const screen = render(
        <Calendar widget={CalendarWidgetInternalEvents} />,
        {},
        { additionalMocks: mocks }
      );
      expect(await screen.findAllByRole('listitem')).not.toHaveLength(0);
      const row = screen.getByRole('listitem', {
        name: /stichtag/i,
      });
      expect(row).toBeVisible();
      expect(row).toHaveTextContent(/18.04.2021/);
      expect(row.querySelector('time')).toBeNull();
    });

    it('should show the correct date for multi-day event', async () => {
      const screen = render(
        <Calendar widget={CalendarWidgetInternalEvents} />,
        {},
        { additionalMocks: mocks }
      );
      expect(await screen.findAllByRole('listitem')).not.toHaveLength(0);
      const row = screen.getAllByRole('listitem', {
        name: /berufsorientierung/i,
      })[0];
      expect(row).toBeVisible();
      expect(row).toHaveTextContent(/15.04.2021 - 18.04.2021/);
      expect(row.querySelector('time')).toBeNull();
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
          {
            type: 'internal',
            calendarId: '1',
            color: 'yellow',
            name: 'Interner Kalender',
            days: 14,
          } as const,
        ],
      },
      calendarEvents: [
        {
          id: '1-1',
          start: '2021-03-18T09:30:00Z',
          end: '2021-03-18T11:00:00Z',
          summary: 'Berufsorientierung',
          description: 'Raum E 10',
          isFullDay: false,
          calendar: { id: '1' },
          recurrence: null,
        },
        {
          id: '1-2',
          start: '2021-01-18T00:00:00Z',
          end: '2021-01-23T00:00:00Z',
          summary: 'B-Woche',
          description: null,
          isFullDay: true,
          calendar: { id: '1' },
          recurrence: null,
        },
      ],
    };

    it('should show the correct number of entries', async () => {
      const screen = render(
        <Calendar widget={CalendarWidgetMultiple} />,
        {},
        { additionalMocks: mocks }
      );
      expect(await screen.findAllByRole('listitem')).toHaveLength(39);
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
      ).toHaveStyle({ color: 'rgb(255, 0, 0)' });

      expect(
        screen.getByRole('figure', { name: 'Legende: Kalender 2' })
      ).toBeVisible();
      expect(
        screen
          .getByRole('figure', { name: 'Legende: Kalender 2' })
          .querySelector<SVGElement>('svg')
      ).toHaveStyle({ color: 'rgb(0, 128, 0)' });

      expect(
        screen.getByRole('figure', { name: 'Legende: Interner Kalender' })
      ).toBeVisible();
      expect(
        screen
          .getByRole('figure', { name: 'Legende: Interner Kalender' })
          .querySelector<SVGElement>('svg')
      ).toHaveStyle({ color: 'rgb(255, 255, 0)' });
    });
  });
});
