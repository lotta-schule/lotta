import { MockedResponse } from '@apollo/client/testing';
import { SplitViewProvider } from '@lotta-schule/hubert';
import {
  CalendarKlassenarbeiten,
  GangamStyleWidget,
  VPLehrerWidget,
  VPSchuelerWidget,
} from 'test/fixtures';
import { render, waitFor } from 'test/util';
import { WidgetEditor } from './WidgetEditor';
import userEvent from '@testing-library/user-event';

import UpdateWidgetMutation from 'api/mutation/UpdateWidgetMutation.graphql';

const renderWithContext: typeof render = (children, ...other) => {
  return render(<SplitViewProvider>{children}</SplitViewProvider>, ...other);
};

describe('layouts/adminLayout/categoryManagment/widgets/WidgetEditor', () => {
  it("should show the widget's title", () => {
    const screen = renderWithContext(
      <WidgetEditor
        selectedWidget={VPSchuelerWidget}
        onSelectWidget={jest.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: 'VP Schüler' })).toBeVisible();
  });

  it("should show the next widget's title when changing 'onSelectedWidget' prop", () => {
    const screen = renderWithContext(
      <WidgetEditor
        selectedWidget={VPSchuelerWidget}
        onSelectWidget={jest.fn()}
      />
    );

    screen.rerender(
      <SplitViewProvider>
        <WidgetEditor
          selectedWidget={VPLehrerWidget}
          onSelectWidget={jest.fn()}
        />
      </SplitViewProvider>
    );

    expect(screen.getByRole('heading', { name: 'VP Lehrer' })).toBeVisible();
  });

  it('should not show any title when no widget is given', () => {
    const screen = renderWithContext(
      <WidgetEditor selectedWidget={null} onSelectWidget={jest.fn()} />
    );
    expect(screen.queryByRole('heading')).toBeNull();
  });

  describe('correct configuration section', () => {
    it('schould show correct Schedule configuration', () => {
      const screen = renderWithContext(
        <WidgetEditor
          selectedWidget={VPSchuelerWidget}
          onSelectWidget={jest.fn()}
        />
      );
      expect(screen.getByTestId('ScheduleWidgetConfiguration')).toBeVisible();
    });
    it('should show correct Calendar configuration', () => {
      const screen = renderWithContext(
        <WidgetEditor
          selectedWidget={CalendarKlassenarbeiten}
          onSelectWidget={jest.fn()}
        />
      );
      expect(screen.getByTestId('CalendarWidgetConfiguration')).toBeVisible();
    });
    it('should show correct IFrame configuration', () => {
      const screen = renderWithContext(
        <WidgetEditor
          selectedWidget={GangamStyleWidget}
          onSelectWidget={jest.fn()}
        />
      );
      expect(screen.getByTestId('IFrameWidgetConfiguration')).toBeVisible();
    });
  });

  describe('updating values', () => {
    const mock: MockedResponse = {
      request: {
        query: UpdateWidgetMutation,
        variables: {
          id: VPSchuelerWidget.id,
          widget: {
            title: 'Neuer Name',
            iconImageFile: null,
            configuration: JSON.stringify(VPSchuelerWidget.configuration),
            groups: [{ id: '1' }, { id: '4' }, { id: '5' }, { id: '10' }],
          },
        },
      },
      result: jest.fn(() => ({
        data: {
          widget: {
            ...VPSchuelerWidget,
            title: 'Neuer Name',
            iconImageFile: null,
            groups: [
              { id: '1', name: 'Gruppe A', sortKey: 10 },
              { id: '4', name: 'Gruppe B', sortKey: 20 },
              { id: '5', name: 'Gruppe C', sortKey: 30 },
              { id: '10', name: 'Gruppe D', sortKey: 40 },
            ],
          },
        },
      })),
    };
    it("should update the widget's properties", async () => {
      const fireEvent = userEvent.setup();
      const screen = renderWithContext(
        <WidgetEditor
          selectedWidget={VPSchuelerWidget}
          onSelectWidget={jest.fn()}
        />,
        {},
        { additionalMocks: [mock] }
      );
      const widgetNameInput = screen.getByRole('textbox', {
        name: /name des widget/i,
      }) as HTMLInputElement;
      await fireEvent.type(widgetNameInput, 'Neuer Name', {
        initialSelectionStart: 0,
        initialSelectionEnd: widgetNameInput.value.length,
      });
      await fireEvent.click(
        screen.getByRole('checkbox', { name: /für alle/i })
      );

      await fireEvent.click(screen.getByRole('button', { name: /speichern/i }));
      await waitFor(() => {
        expect(mock.result).toHaveBeenCalled();
      });
    });
  });

  it('should open a confirm dialog when "delete" button is clicked', async () => {
    const fireEvent = userEvent.setup();
    const screen = renderWithContext(
      <WidgetEditor
        selectedWidget={VPSchuelerWidget}
        onSelectWidget={jest.fn()}
      />
    );
    await fireEvent.click(screen.getByRole('button', { name: /löschen/ }));
    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /marginale löschen/i })
      ).toBeVisible();
    });
  });
});
