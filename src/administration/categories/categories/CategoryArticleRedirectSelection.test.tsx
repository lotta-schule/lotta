import { render, waitFor } from 'test/util';
import { CategoryArticleRedirectSelection } from './CategoryArticleRedirectSelection';
import { ComputerExperten } from 'test/fixtures';
import { MockedResponse } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';

import SearchQuery from 'api/query/SearchQuery.graphql';
import GetArticleForPreviewQuery from 'api/query/GetArticleForPreviewQuery.graphql';

describe('administration/categories/categories/CategoryArticleRedirectSelection', () => {
    it('should show a search field and select an article', async () => {
        const selectRedirectPath = jest.fn();
        const screen = render(
            <CategoryArticleRedirectSelection
                redirectPath={'/a/'}
                onSelectRedirectPath={selectRedirectPath}
            />,
            {},
            {
                additionalMocks: [
                    {
                        request: {
                            query: SearchQuery,
                            variables: {
                                searchText: 'Test',
                            },
                        },
                        result: { data: { results: [ComputerExperten] } },
                    },
                ],
            }
        );

        expect(
            screen.getByRole('textbox', { name: /beitrag suchen/i })
        ).toBeVisible();
        userEvent.type(
            screen.getByRole('textbox', { name: /beitrag suchen/i }),
            'Test'
        );
        await waitFor(() => {
            expect(
                screen.getByRole('option', { name: /Computerexperten/ })
            ).toBeVisible();
        });
        userEvent.click(
            screen.getByRole('option', { name: /Computerexperten/ })
        );

        await waitFor(() => {
            expect(selectRedirectPath).toHaveBeenCalledWith(
                '/a/1-Computerexperten'
            );
        });
        expect(
            screen.getByRole('textbox', { name: /beitrag suchen/i })
        ).toHaveValue('');
    });

    describe('show the currently selected article', () => {
        const additionalMocks: MockedResponse[] = [
            {
                request: {
                    query: GetArticleForPreviewQuery,
                    variables: { id: 1 },
                },
                result: {
                    data: { article: ComputerExperten },
                },
            },
        ];

        it('should show the path if article has not yet been loaded', () => {
            const screen = render(
                <CategoryArticleRedirectSelection
                    redirectPath={'/a/1-Computerexperten'}
                    onSelectRedirectPath={jest.fn()}
                />,
                {},
                { additionalMocks }
            );
            expect(
                screen.getByText(
                    'Kategorie wird zu /a/1-Computerexperten weitergeleitet'
                )
            ).toBeVisible();
        });

        it('should not show info text when redirect path is default path ("/a/")', () => {
            const screen = render(
                <CategoryArticleRedirectSelection
                    redirectPath={'/a/'}
                    onSelectRedirectPath={jest.fn()}
                />,
                {},
                { additionalMocks }
            );
            expect(
                screen.queryByText(/kategorie wird .* weitergeleitet/i)
            ).toBeNull();
        });

        it('it should show an ArticlePreview for the selected path', async () => {
            const screen = render(
                <CategoryArticleRedirectSelection
                    redirectPath={'/a/1-Computerexperten'}
                    onSelectRedirectPath={jest.fn()}
                />,
                {},
                { additionalMocks }
            );

            await waitFor(() => {
                expect(
                    screen.getByTestId('ArticlePreviewDensedLayout')
                ).toBeVisible();
            });
            expect(screen.getByRole('heading')).toHaveTextContent(
                'Computerexperten'
            );
        });
    });
});
