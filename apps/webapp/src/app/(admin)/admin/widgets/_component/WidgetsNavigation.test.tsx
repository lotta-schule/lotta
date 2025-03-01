import { MockedResponse } from '@apollo/client/testing';
import {
  CalendarKlassenarbeiten,
  GangamStyleWidget,
  VPLehrerWidget,
  VPSchuelerWidget,
} from 'test/fixtures';
import { render, waitFor } from 'test/util';
import { WidgetsNavigation } from './WidgetsNavigation';
import { MockRouter } from 'test/mocks';
import userEvent from '@testing-library/user-event';

import GetWidgetsQuery from 'api/query/GetWidgetsQuery.graphql';

const widgets = [
  GangamStyleWidget,
  VPSchuelerWidget,
  VPLehrerWidget,
  CalendarKlassenarbeiten,
];

const additionalMocks: MockedResponse[] = [
  {
    request: {
      query: GetWidgetsQuery,
    },
    result: {
      data: {
        widgets,
      },
    },
  },
];

describe('layouts/adminLayout/categoryManagment/widgets/WidgetsNavigation', () => {
  it('should list the widgets', async () => {
    const screen = render(<WidgetsNavigation />, {}, { additionalMocks });

    screen.rerender(<WidgetsNavigation />); // rerender to trigger the query

    await waitFor(() => {
      expect(screen.getByRole('list')).toBeVisible();
    });
    expect(screen.queryAllByRole('listitem')).toHaveLength(4);
  });

  it('should select a widget', async () => {
    const user = userEvent.setup();
    const mockRouter = await vi
      .importMock<{ mockRouter: MockRouter }>('next/navigation')
      .then((m) => m.mockRouter);
    const screen = render(<WidgetsNavigation />, {}, { additionalMocks });
    screen.rerender(<WidgetsNavigation />); // rerender to trigger the query

    await waitFor(() => {
      expect(
        screen.getByRole('listitem', { name: /vp schüler/i })
      ).toBeVisible();
    });

    await user.click(screen.getByRole('listitem', { name: /vp schüler/i }));

    await waitFor(() => {
      expect(mockRouter._push).toHaveBeenLastCalledWith(
        `/admin/widgets/${VPSchuelerWidget.id}`,
        `/admin/widgets/${VPSchuelerWidget.id}`,
        undefined
      );
    });
  });
});
