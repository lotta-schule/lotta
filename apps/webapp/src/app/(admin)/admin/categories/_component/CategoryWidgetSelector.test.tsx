import * as React from 'react';
import { render, screen, waitFor, userEvent } from 'test/util';
import { CategoryWidgetSelector } from './CategoryWidgetSelector';
import { WidgetModel, WidgetModelType } from 'model';

import GetWidgetsQuery from 'api/query/GetWidgetsQuery.graphql';

const widgets: WidgetModel[] = [
  {
    id: '1',
    title: 'WidgetOne',
    type: WidgetModelType.Calendar,
    configuration: {},
    groups: [],
    iconImageFile: null,
  },
  {
    id: '2',
    title: 'WidgetTwo',
    type: WidgetModelType.Calendar,
    configuration: {},
    groups: [],
    iconImageFile: null,
  },
  {
    id: '3',
    title: 'WidgetThree',
    type: WidgetModelType.Calendar,
    configuration: {},
    groups: [],
    iconImageFile: null,
  },
  {
    id: '4',
    title: 'W Number 4',
    type: WidgetModelType.Calendar,
    configuration: {},
    groups: [],
    iconImageFile: null,
  },
  {
    id: '5',
    title: 'W Number 5',
    type: WidgetModelType.Calendar,
    configuration: {},
    groups: [],
    iconImageFile: null,
  },
];

describe('shared/layouts/SearchLayout', () => {
  describe('CategoryWidgetSelector', () => {
    const mocks = [
      {
        request: { query: GetWidgetsQuery },
        result: { data: { widgets } },
      },
    ];
    describe('show widgets state', () => {
      it('should show all possible widgets in a list', async () => {
        render(
          <CategoryWidgetSelector
            selectedWidgets={[]}
            setSelectedWidgets={() => {}}
          />,
          {},
          { additionalMocks: mocks }
        );
        await screen.findByTestId('WidgetsSelectionList');
        expect(screen.getByLabelText('WidgetOne')).toBeInTheDocument();
        expect(screen.getByLabelText('WidgetTwo')).toBeInTheDocument();
        expect(screen.getByLabelText('WidgetThree')).toBeInTheDocument();
        expect(screen.getByLabelText('W Number 4')).toBeInTheDocument();
        expect(screen.getByLabelText('W Number 5')).toBeInTheDocument();
      });

      it('should show the given "selectedWidgets" with an enabled switch', async () => {
        render(
          <CategoryWidgetSelector
            selectedWidgets={[widgets[2], widgets[4]]}
            setSelectedWidgets={() => {}}
          />,
          {},
          { additionalMocks: mocks }
        );
        const [w0, w1, w2, w3, w4] = await Promise.all([
          screen.findByLabelText('WidgetOne'),
          screen.findByLabelText('WidgetTwo'),
          screen.findByLabelText('WidgetThree'),
          screen.findByLabelText('W Number 4'),
          screen.findByLabelText('W Number 5'),
        ]);

        expect(w0).not.toBeChecked();
        expect(w1).not.toBeChecked();
        expect(w2).toBeChecked();
        expect(w3).not.toBeChecked();
        expect(w4).toBeChecked();
      });

      it('should show have the "enable all widgets" toggle enabled when all widgets are enabled', async () => {
        render(
          <CategoryWidgetSelector
            selectedWidgets={[...widgets]}
            setSelectedWidgets={() => {}}
          />,
          {},
          { additionalMocks: mocks }
        );

        await screen.findByTestId('WidgetsSelectionList');
        expect(
          screen.queryByLabelText('Alle Marginalen aktivieren')
        ).toBeChecked();
        expect(screen.queryByLabelText('WidgetOne')).toBeChecked();
        expect(screen.queryByLabelText('WidgetTwo')).toBeChecked();
        expect(screen.queryByLabelText('WidgetThree')).toBeChecked();
        expect(screen.queryByLabelText('W Number 4')).toBeChecked();
        expect(screen.queryByLabelText('W Number 5')).toBeChecked();
      });
    });

    describe('select widgets', () => {
      it('should select a widget when clicked', async () => {
        const fireEvent = userEvent.setup();
        const setSelectedWidgets = vi.fn();
        render(
          <CategoryWidgetSelector
            selectedWidgets={[]}
            setSelectedWidgets={setSelectedWidgets}
          />,
          {},
          { additionalMocks: mocks }
        );

        const w0 = await screen.findByLabelText('WidgetOne');
        await fireEvent.click(w0);
        await waitFor(() => {
          expect(setSelectedWidgets).toHaveBeenCalledWith([widgets[0]]);
        });
      });

      it('should deselect when clicked but already selected', async () => {
        const fireEvent = userEvent.setup();
        const setSelectedWidgets = vi.fn();
        render(
          <CategoryWidgetSelector
            selectedWidgets={[widgets[0]]}
            setSelectedWidgets={setSelectedWidgets}
          />,
          {},
          { additionalMocks: mocks }
        );

        const w0 = await screen.findByLabelText('WidgetOne');
        await fireEvent.click(w0);
        await waitFor(() => {
          expect(setSelectedWidgets).toHaveBeenCalledWith([]);
        });
      });

      it('should select all widgets when "toggle all" is clicked', async () => {
        const fireEvent = userEvent.setup();
        const setSelectedWidgets = vi.fn();
        render(
          <CategoryWidgetSelector
            selectedWidgets={[]}
            setSelectedWidgets={setSelectedWidgets}
          />,
          {},
          { additionalMocks: mocks }
        );

        const allToggler = await screen.findByLabelText(
          'Alle Marginalen aktivieren'
        );
        await fireEvent.click(allToggler);
        await waitFor(() => {
          expect(setSelectedWidgets).toHaveBeenCalledWith(widgets);
        });
      });

      it('should deselect all widgets when all are selected and "toggle all" is clicked', async () => {
        const fireEvent = userEvent.setup();
        const setSelectedWidgets = vi.fn();
        render(
          <CategoryWidgetSelector
            selectedWidgets={[...widgets]}
            setSelectedWidgets={setSelectedWidgets}
          />,
          {},
          { additionalMocks: mocks }
        );

        const allToggler = await screen.findByLabelText(
          'Alle Marginalen aktivieren'
        );
        await fireEvent.click(allToggler);
        await waitFor(() => {
          expect(setSelectedWidgets).toHaveBeenCalledWith([]);
        });
      });
    });
  });
});
