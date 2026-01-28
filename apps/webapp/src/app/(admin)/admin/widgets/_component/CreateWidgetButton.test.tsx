import { WidgetModelType } from 'model';
import { render, waitFor, userEvent } from 'test/util';
import { MockRouter } from 'test/mocks';
import { CreateWidgetButton } from './CreateWidgetButton';

import CreateWidgetMutation from 'api/mutation/CreateWidgetMutation.graphql';

const newWidget = {
  id: 'new-calendar-widget',
  title: 'Kalender',
  type: WidgetModelType.Calendar,
  groups: [],
  configuration: {},
  iconImageFile: null,
};

describe('CreateWidgetButton', () => {
  it('should create a calendar widget', async () => {
    const user = userEvent.setup();
    const onCreateWidget = vi.fn(() => ({
      data: {
        widget: newWidget,
      },
    }));

    const screen = render(
      <CreateWidgetButton />,
      {},
      {
        additionalMocks: [
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
      expect(screen.getByRole('button')).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: /neue marginale/i }));

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /kalender/i })).toBeVisible();
    });

    await new Promise((resolve) => setTimeout(resolve, 500)); // wait for the animation to finish

    await user.click(screen.getByRole('menuitem', { name: /kalender/i }));

    await waitFor(() => {
      expect(onCreateWidget).toHaveBeenCalled();
    });
  });

  it('should create a schedule widget', async () => {
    const user = userEvent.setup();

    const onCreateWidget = vi.fn(() => ({
      data: {
        widget: newWidget,
      },
    }));

    const screen = render(
      <CreateWidgetButton />,
      {},
      {
        additionalMocks: [
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
      expect(screen.getByRole('button')).toBeVisible();
    });

    await new Promise((resolve) => setTimeout(resolve, 500)); // wait for the animation to finish

    await user.click(screen.getByRole('button', { name: /neue marginale/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', { name: /vertretungsplan/i })
      ).toBeVisible();
    });

    await new Promise((resolve) => setTimeout(resolve, 500)); // wait for the animation to finish

    await user.click(
      screen.getByRole('menuitem', { name: /vertretungsplan/i })
    );

    await waitFor(() => {
      expect(onCreateWidget).toHaveBeenCalled();
    });
  });

  it('should create an iframe widget', async () => {
    const user = userEvent.setup();
    const mockRouter = await vi
      .importMock<{
        default: {
          useRouter: () => MockRouter;
        };
      }>('next/navigation')
      .then((module) => module.default.useRouter());

    const onCreateWidget = vi.fn(() => ({
      data: {
        widget: newWidget,
      },
    }));

    const screen = render(
      <CreateWidgetButton />,
      {},
      {
        additionalMocks: [
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
      expect(screen.getByRole('button')).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: /neue marginale/i }));

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /webseite/i })).toBeVisible();
    });

    await new Promise((resolve) => setTimeout(resolve, 500)); // wait for the animation to finish

    await user.click(screen.getByRole('menuitem', { name: /webseite/i }));

    await waitFor(() => {
      expect(mockRouter._push).toHaveBeenLastCalledWith(
        `/admin/widgets/${newWidget.id}`,
        `/admin/widgets/${newWidget.id}`,
        undefined
      );
    });
  });
});
