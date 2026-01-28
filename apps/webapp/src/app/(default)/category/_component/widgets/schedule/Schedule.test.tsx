import * as React from 'react';
import { render, waitFor } from 'test/util';
import { ScheduleResponse, SomeUserin, VPSchuelerWidget } from 'test/fixtures';
import { Schedule } from './Schedule';

import GetScheduleQuery from 'api/query/GetScheduleQuery.graphql';

describe('shared/widgets/Schedule', () => {
  const pupil = {
    ...SomeUserin,
    class: '10/1',
  };

  let didLoadLastSchedule = false,
    didLoadCurrentSchedule = false,
    didLoadNextSchedule = false;

  beforeEach(() => {
    didLoadLastSchedule = false;
    didLoadCurrentSchedule = false;
    didLoadNextSchedule = false;
  });

  const getScheduleResponse = () =>
    JSON.parse(JSON.stringify(ScheduleResponse));

  const mocks = [
    {
      request: {
        query: GetScheduleQuery,
        variables: { widgetId: VPSchuelerWidget.id, date: undefined },
      },
      result: () => {
        didLoadCurrentSchedule = true;
        return { data: getScheduleResponse() };
      },
    },
    {
      request: {
        query: GetScheduleQuery,
        variables: {
          widgetId: VPSchuelerWidget.id,
          date: '2020-11-13',
        },
      },
      result: () => {
        didLoadLastSchedule = true;
        const lastScheduleResponse = getScheduleResponse();
        lastScheduleResponse.schedule.head.date = 'Freitag, 13. November 2020';
        return { data: lastScheduleResponse };
      },
    },
    {
      request: {
        query: GetScheduleQuery,
        variables: {
          widgetId: VPSchuelerWidget.id,
          date: '2020-11-16',
        },
      },
      result: () => {
        didLoadCurrentSchedule = true;
        return { data: getScheduleResponse() };
      },
    },
    {
      request: {
        query: GetScheduleQuery,
        variables: {
          widgetId: VPSchuelerWidget.id,
          date: '2020-11-18',
        },
      },
      result: () => {
        didLoadNextSchedule = true;
        const nextScheduleResponse = getScheduleResponse();
        nextScheduleResponse.schedule.head.date = 'Mittwoch, 18. November 2020';
        return { data: nextScheduleResponse };
      },
    },
  ];

  describe("Pupil's Schedule", () => {
    it('should show an information and a link to profile if userAvatar has no class', async () => {
      const screen = render(
        <Schedule widget={VPSchuelerWidget} />,
        {},
        {
          currentUser: SomeUserin,
          additionalMocks: mocks,
        }
      );
      await waitFor(() => {
        expect(
          screen.getByRole('alert', { name: /hast keine klasse/i })
        ).toBeVisible();
      });
      expect(screen.getByRole('link', { name: /mein profil/i })).toBeVisible();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/profile');
    });

    it('should show a current schedule', async () => {
      const screen = render(
        <Schedule widget={VPSchuelerWidget} />,
        {},
        { currentUser: pupil, additionalMocks: mocks }
      );
      await waitFor(() => {
        expect(didLoadCurrentSchedule).toEqual(true);
      });
      expect(screen.getByText(/16\. november 2020/i)).toBeVisible();
      expect(screen.getByRole('row', { name: /1 DE ESn E107/i })).toBeVisible();
      expect(
        screen.getByRole('row', { name: /8 sm15 XMei HDS2/i })
      ).toBeVisible();
      expect(screen.getByRole('row', { name: /alles anders/i })).toBeVisible();
      expect(
        screen.getByRole('row', { name: /8 sw1 Wal BSZ2/i })
      ).toBeVisible();
    });

    it('should propose buttons for the (correct) previous and next days', async () => {
      const screen = render(
        <Schedule widget={VPSchuelerWidget} />,
        {},
        { currentUser: pupil, additionalMocks: mocks }
      );
      await waitFor(() => {
        expect(didLoadCurrentSchedule).toEqual(true);
      });
      await waitFor(() => {
        expect(didLoadLastSchedule).toEqual(true);
      });
      await waitFor(() => {
        expect(didLoadNextSchedule).toEqual(true);
      });
      expect(screen.getByText(/16\. november 2020/i)).toBeVisible();
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /13\. november 2020/i })
        ).toBeVisible();
        expect(
          screen.getByRole('button', { name: /18\. november 2020/i })
        ).toBeVisible();
      });
    });
  });

  it("should not show the 'next day' button if no schedule is available", async () => {
    const mocksWithError = mocks
      .filter((m) => m.request.variables.date !== '2020-11-18')
      .concat([
        {
          request: {
            query: GetScheduleQuery,
            variables: {
              widgetId: VPSchuelerWidget.id,
              date: '2020-11-18',
            },
          },
          result: () => {
            didLoadNextSchedule = true;
            const nextScheduleResponse = getScheduleResponse();
            nextScheduleResponse.schedule = null;
            return { data: nextScheduleResponse };
          },
        },
      ]);

    const screen = render(
      <Schedule widget={VPSchuelerWidget} />,
      {},
      {
        currentUser: pupil,
        additionalMocks: mocksWithError,
      }
    );
    await waitFor(() => {
      expect(didLoadCurrentSchedule).toEqual(true);
      expect(didLoadLastSchedule).toEqual(true);
    });
    expect(screen.getByText(/16\. november 2020/i)).toBeVisible();
    expect(
      screen.getByRole('button', { name: /13\. november 2020/i })
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /18\. november 2020/i })
    ).toBeNull();
  });

  it("should not show the 'last day' button if no schedule is available", async () => {
    const mocksWithError = mocks
      .filter((m) => m.request.variables.date !== '2020-11-13')
      .concat([
        {
          request: {
            query: GetScheduleQuery,
            variables: {
              widgetId: VPSchuelerWidget.id,
              date: '2020-11-13',
            },
          },
          error: new Error('Upsi'),
        } as any,
      ]);

    const screen = render(
      <Schedule widget={VPSchuelerWidget} />,
      {},
      {
        currentUser: pupil,
        additionalMocks: mocksWithError,
      }
    );
    await waitFor(() => {
      expect(didLoadCurrentSchedule).toEqual(true);
    });
    await waitFor(() => {
      expect(screen.getByText(/16\. november 2020/i)).toBeVisible();
      expect(
        screen.queryByRole('button', { name: /13\. november 2020/i })
      ).toBeNull();
      expect(
        screen.getByRole('button', { name: /18\. november 2020/i })
      ).toBeVisible();
    });
  });
});
