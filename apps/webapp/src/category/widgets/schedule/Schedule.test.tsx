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

  const getScheduleResponse = () =>
    JSON.parse(JSON.stringify(ScheduleResponse));

  const createMocks = () => [
    {
      request: {
        query: GetScheduleQuery,
        variables: { widgetId: VPSchuelerWidget.id, date: undefined },
      },
      result: vi.fn(() => {
        return { data: getScheduleResponse() };
      }),
    },
    {
      request: {
        query: GetScheduleQuery,
        variables: {
          widgetId: VPSchuelerWidget.id,
          date: '2020-11-13',
        },
      },
      result: vi.fn(() => {
        const lastScheduleResponse = getScheduleResponse();
        lastScheduleResponse.schedule.head.date = 'Freitag, 13. November 2020';
        return { data: lastScheduleResponse };
      }),
    },
    {
      request: {
        query: GetScheduleQuery,
        variables: {
          widgetId: VPSchuelerWidget.id,
          date: '2020-11-16',
        },
      },
      result: vi.fn(() => {
        return { data: getScheduleResponse() };
      }),
    },
    {
      request: {
        query: GetScheduleQuery,
        variables: {
          widgetId: VPSchuelerWidget.id,
          date: '2020-11-18',
        },
      },
      result: vi.fn(() => {
        const nextScheduleResponse = getScheduleResponse();
        nextScheduleResponse.schedule.head.date = 'Mittwoch, 18. November 2020';
        return { data: nextScheduleResponse };
      }),
    },
  ];

  describe("Pupil's Schedule", () => {
    it('should show an information and a link to profile if userAvatar has no class', async () => {
      const mocks = createMocks();
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
      const mocks = createMocks();
      const screen = render(
        <Schedule widget={VPSchuelerWidget} />,
        {},
        { currentUser: pupil, additionalMocks: mocks }
      );
      await waitFor(() => {
        expect(mocks[0].result).toHaveBeenCalled();
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
      const mocks = createMocks();
      const screen = render(
        <Schedule widget={VPSchuelerWidget} />,
        {},
        { currentUser: pupil, additionalMocks: mocks }
      );
      await waitFor(() => {
        expect(mocks[0].result).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(mocks[1].result).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(mocks[3].result).toHaveBeenCalled();
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
    const mocksWithError = createMocks()
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
          result: vi.fn(() => {
            const nextScheduleResponse = getScheduleResponse();
            nextScheduleResponse.schedule = null;
            return { data: nextScheduleResponse };
          }),
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
      expect(mocksWithError[0].result).toHaveBeenCalled();
      expect(mocksWithError[1].result).toHaveBeenCalled();
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
    const mocksWithError = createMocks()
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
      expect(mocksWithError[0].result).toHaveBeenCalled();
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
