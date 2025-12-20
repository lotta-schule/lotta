import { MockLink } from '@apollo/client/testing';
import {
  CalendarKlassenarbeiten,
  GangamStyleWidget,
  VPSchuelerWidget,
} from 'test/fixtures';
import { render, waitFor } from 'test/util';
import { WidgetEditor } from './WidgetEditor';
import userEvent from '@testing-library/user-event';

import UpdateWidgetMutation from 'api/mutation/UpdateWidgetMutation.graphql';

describe("Administrators' WidgetEditor", () => {
  it("should have the widget's name in the name input field", () => {
    const screen = render(<WidgetEditor widget={VPSchuelerWidget} />);

    expect(
      screen.getByRole('textbox', { name: /name des widget/i })
    ).toHaveValue('VP Schüler');
  });

  describe('correct configuration section', () => {
    it('schould show correct Schedule configuration', () => {
      const screen = render(<WidgetEditor widget={VPSchuelerWidget} />);
      expect(screen.getByTestId('ScheduleWidgetConfiguration')).toBeVisible();
    });
    it('should show correct Calendar configuration', () => {
      const screen = render(<WidgetEditor widget={CalendarKlassenarbeiten} />);
      expect(screen.getByTestId('CalendarWidgetConfiguration')).toBeVisible();
    });
    it('should show correct IFrame configuration', () => {
      const screen = render(<WidgetEditor widget={GangamStyleWidget} />);
      expect(screen.getByTestId('IFrameWidgetConfiguration')).toBeVisible();
    });
  });

  describe('updating values', () => {
    const mock: MockLink.MockedResponse = {
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
      result: vi.fn(() => ({
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
      const screen = render(
        <WidgetEditor widget={VPSchuelerWidget} />,
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
    const screen = render(<WidgetEditor widget={VPSchuelerWidget} />);
    await fireEvent.click(screen.getByRole('button', { name: /löschen/ }));
    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /marginale löschen/i })
      ).toBeVisible();
    });
  });
});
