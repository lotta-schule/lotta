import { MockedResponse } from '@apollo/client/testing';
import { SplitViewProvider } from '@lotta-schule/hubert';
import {
  CalendarKlassenarbeiten,
  GangamStyleWidget,
  VPLehrerWidget,
  VPSchuelerWidget,
} from 'test/fixtures';
import { WidgetModelType } from 'model';
import { render, waitFor } from 'test/util';
import { WidgetList } from './WidgetList';
import userEvent from '@testing-library/user-event';

import GetWidgetsQuery from 'api/query/GetWidgetsQuery.graphql';
import CreateWidgetMutation from 'api/mutation/CreateWidgetMutation.graphql';

const renderWithContext: typeof render = (children, ...other) => {
  return render(<SplitViewProvider>{children}</SplitViewProvider>, ...other);
};

const additionalMocks: MockedResponse[] = [
  {
    request: {
      query: GetWidgetsQuery,
    },
    result: {
      data: {
        widgets: [
          GangamStyleWidget,
          VPSchuelerWidget,
          VPLehrerWidget,
          CalendarKlassenarbeiten,
        ],
      },
    },
  },
];

const newWidget = {
  id: 'new-calendar-widget',
  title: 'Kalender',
  type: WidgetModelType.Calendar,
  groups: [],
  configuration: {},
  iconImageFile: null,
};

describe('layouts/adminLayout/categoryManagment/widgets/WidgetList', () => {
  it('should list the widgets', async () => {
    const screen = renderWithContext(<WidgetList />, {}, { additionalMocks });

    await waitFor(() => {
      expect(screen.getByRole('list')).toBeVisible();
    });
    expect(screen.queryAllByRole('listitem')).toHaveLength(4);
  });

  it('should select a widget', async () => {
    const fireEvent = userEvent.setup();
    const screen = renderWithContext(<WidgetList />, {}, { additionalMocks });

    await waitFor(() => {
      expect(
        screen.getByRole('listitem', { name: /vp schüler/i })
      ).toBeVisible();
    });

    await fireEvent.click(
      screen.getByRole('listitem', { name: /vp schüler/i })
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /vp schüler/i })
      ).toBeVisible();
    });
  });

  describe('Create new widget', () => {
    it('should create a calendar widget', async () => {
      const fireEvent = userEvent.setup();
      const onCreateWidget = vi.fn(() => ({
        data: {
          widget: newWidget,
        },
      }));

      const screen = renderWithContext(
        <WidgetList />,
        {},
        {
          additionalMocks: [
            ...additionalMocks,
            {
              request: {
                query: CreateWidgetMutation,
                variables: {
                  title: 'Kalender',
                  type: WidgetModelType.Calendar,
                },
              },
              result: onCreateWidget,
            },
          ],
        }
      );

      await waitFor(() => {
        expect(screen.getByRole('list')).toBeVisible();
      });

      await fireEvent.click(
        screen.getByRole('button', { name: /neue marginale/i })
      );

      await waitFor(() => {
        expect(
          screen.getByRole('menuitem', { name: /kalender/i })
        ).toBeVisible();
      });

      await new Promise((resolve) => setTimeout(resolve, 500)); // wait for the animation to finish

      await fireEvent.click(
        screen.getByRole('menuitem', { name: /kalender/i })
      );

      await waitFor(() => {
        expect(onCreateWidget).toHaveBeenCalled();
      });
    });

    it('should create a schedule widget', async () => {
      const fireEvent = userEvent.setup();

      const onCreateWidget = vi.fn(() => ({
        data: {
          widget: newWidget,
        },
      }));

      const screen = renderWithContext(
        <WidgetList />,
        {},
        {
          additionalMocks: [
            ...additionalMocks,
            {
              request: {
                query: CreateWidgetMutation,
                variables: { title: 'VPlan', type: WidgetModelType.Schedule },
              },
              result: onCreateWidget,
            },
          ],
        }
      );

      await waitFor(() => {
        expect(screen.getByRole('list')).toBeVisible();
      });

      await new Promise((resolve) => setTimeout(resolve, 500)); // wait for the animation to finish

      await fireEvent.click(
        screen.getByRole('button', { name: /neue marginale/i })
      );

      await waitFor(() => {
        expect(
          screen.getByRole('menuitem', { name: /vertretungsplan/i })
        ).toBeVisible();
      });

      await new Promise((resolve) => setTimeout(resolve, 500)); // wait for the animation to finish

      await fireEvent.click(
        screen.getByRole('menuitem', { name: /vertretungsplan/i })
      );

      await waitFor(() => {
        expect(onCreateWidget).toHaveBeenCalled();
      });
    });

    it('should create an iframe widget', async () => {
      const fireEvent = userEvent.setup();
      const onCreateWidget = vi.fn(() => ({
        data: {
          widget: newWidget,
        },
      }));

      const screen = renderWithContext(
        <WidgetList />,
        {},
        {
          additionalMocks: [
            ...additionalMocks,
            {
              request: {
                query: CreateWidgetMutation,
                variables: {
                  title: 'Webseite',
                  type: WidgetModelType.IFrame,
                },
              },
              result: onCreateWidget,
            },
          ],
        }
      );

      await waitFor(() => {
        expect(screen.getByRole('list')).toBeVisible();
      });

      await fireEvent.click(
        screen.getByRole('button', { name: /neue marginale/i })
      );

      await waitFor(() => {
        expect(
          screen.getByRole('menuitem', { name: /webseite/i })
        ).toBeVisible();
      });

      await new Promise((resolve) => setTimeout(resolve, 500)); // wait for the animation to finish

      await fireEvent.click(
        screen.getByRole('menuitem', { name: /webseite/i })
      );

      await waitFor(() => {
        expect(onCreateWidget).toHaveBeenCalled();
      });
    });
  });
});
