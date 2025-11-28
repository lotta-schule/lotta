import * as React from 'react';
import { render } from 'test/util';
import { CalendarEntry } from './CalendarEntry';

describe('CalendarEntry', () => {
  it('should show date and start + end time for one-day-event', () => {
    const start = new Date('2021-03-18');
    start.setHours(9, 30, 0, 0);
    const end = new Date('2021-03-18');
    end.setHours(11, 0, 0, 0);

    const { getByText } = render(
      <CalendarEntry
        event={{
          uid: '0',
          description: 'Test',
          end: end.toISOString(),
          start: start.toISOString(),
          summary: 'Test',
        }}
      />
    );

    expect(getByText('18.03.2021')).toBeVisible();
    expect(getByText(/09:30 - 11:00/)).toBeVisible();
  });

  it('should show dates and start + end time for multi-day-event', () => {
    const start = new Date('2021-03-18');
    start.setHours(9, 30, 0, 0);
    const end = new Date('2021-03-19');
    end.setHours(11, 0, 0, 0);

    const { getByText } = render(
      <CalendarEntry
        event={{
          uid: '0',
          description: 'Test',
          end: end.toISOString(),
          start: start.toISOString(),
          summary: 'Test',
        }}
      />
    );

    expect(getByText('18.03.2021 - 19.03.2021')).toBeVisible();
    expect(getByText(/09:30 - 11:00/)).toBeVisible();
  });

  it('should show date and no start + end time for full-day-event', () => {
    const start = new Date('2021-03-18T00:00:00.000Z');
    const end = new Date('2021-03-19T00:00:00.000Z');

    const { getByText, queryByRole } = render(
      <CalendarEntry
        event={{
          uid: '0',
          description: 'Test',
          end: end.toISOString(),
          start: start.toISOString(),
          summary: 'Test',
        }}
      />
    );

    expect(getByText('18.03.2021')).toBeVisible();
    expect(queryByRole('time')).toBeNull();
  });

  it('should show dates and no start + end time for multiple-full-day-event', () => {
    const start = new Date('2021-03-18T00:00:00.000Z');
    const end = new Date('2021-03-21T00:00:00.000Z');

    const { getByText, queryByRole } = render(
      <CalendarEntry
        event={{
          uid: '0',
          description: 'Test',
          end: end.toISOString(),
          start: start.toISOString(),
          summary: 'Test',
        }}
      />
    );

    expect(getByText('18.03.2021 - 21.03.2021')).toBeVisible();
    expect(queryByRole('time')).toBeNull();
  });
});
