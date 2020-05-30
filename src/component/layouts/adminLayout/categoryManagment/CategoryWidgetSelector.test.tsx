import React from 'react';
import { render, cleanup } from 'test/util';
import { MockedProvider } from '@apollo/client/testing';
import { CategoryWidgetSelector } from './CategoryWidgetSelector';
import { GetWidgetsQuery } from 'api/query/GetWidgetsQuery';
import { WidgetModel, WidgetModelType } from 'model';
import * as testingLibrary from '@testing-library/react';

afterEach(cleanup);

const widgets: WidgetModel[] = [
    { id: 1, title: 'WidgetOne', type: WidgetModelType.Calendar, configuration: {}, groups: [], iconImageFile: null },
    { id: 2, title: 'WidgetTwo', type: WidgetModelType.Calendar, configuration: {}, groups: [], iconImageFile: null },
    { id: 3, title: 'WidgetThree', type: WidgetModelType.Calendar, configuration: {}, groups: [], iconImageFile: null },
    { id: 4, title: 'W Number 4', type: WidgetModelType.Calendar, configuration: {}, groups: [], iconImageFile: null },
    { id: 5, title: 'W Number 5', type: WidgetModelType.Calendar, configuration: {}, groups: [], iconImageFile: null },
];

describe('component/layouts/SearchLayout', () => {
    describe('CategoryWidgetSelector', () => {
        it('should render the CategoryWidgetSelector', async done => {
            const mocks = [
                {
                    request: {
                        query: GetWidgetsQuery
                    },
                    result: {
                        data: {
                            widgets
                        }
                    }
                }
            ];
            render(
                <MockedProvider mocks={mocks}>
                    <CategoryWidgetSelector selectedWidgets={[]} setSelectedWidgets={() => {}} />
                </MockedProvider>
            );
            done();
        });

        it('should show all possible widgets on left side', async done => {
            const mocks = [
                {
                    request: {
                        query: GetWidgetsQuery
                    },
                    result: {
                        data: {
                            widgets
                        }
                    }
                }
            ];
            const { findByText, getAllByTestId } = render(
                <MockedProvider mocks={mocks}>
                    <CategoryWidgetSelector selectedWidgets={[]} setSelectedWidgets={() => {}} />
                </MockedProvider>
            );
            await findByText('Mögliche Marginale');
            const [container] = getAllByTestId('WidgetsSelectionList');
            testingLibrary.getByText(container, 'WidgetOne');
            testingLibrary.getByText(container, 'WidgetTwo');
            testingLibrary.getByText(container, 'WidgetThree');
            testingLibrary.getByText(container, 'W Number 4');
            testingLibrary.getByText(container, 'W Number 5');

            done();
        });

    });

});
