import * as React from 'react';
import { render, waitFor } from 'test/util';
import { ComputerExperten, FaecherCategory } from 'test/fixtures';
import { SearchPage } from './SearchPage';
import userEvent from '@testing-library/user-event';

import SearchQuery from 'api/query/SearchQuery.graphql';
import { act } from 'react-dom/test-utils';

describe('pages/search', () => {
    describe('Search', () => {
        it('should render the search page', async () => {
            render(<SearchPage />);
        });

        it('should have the correct title', () => {
            const screen = render(<SearchPage />);
            expect(screen.container.querySelector('h2')).toHaveTextContent(
                'Suche'
            );
        });

        it('should issue a search request after typing', async () => {
            const screen = render(
                <SearchPage />,
                {},
                {
                    additionalMocks: [
                        {
                            request: {
                                query: SearchQuery,
                                variables: {
                                    searchText: 'Test',
                                    options: { categoryId: null },
                                },
                            },
                            result: { data: { results: [ComputerExperten] } },
                        },
                    ],
                }
            );
            userEvent.type(screen.getByLabelText('Suchbegriff'), 'Test');
            await waitFor(() => {
                const articlePreviews = screen.getAllByTestId(
                    'ArticlePreviewDensedLayout'
                );
                expect(articlePreviews).toHaveLength(1);
                expect(screen.getByText('Computerexperten')).not.toBeNull();
            });
        });

        describe('filtering', () => {
            it('should open and close search filter', async () => {
                const screen = render(<SearchPage />, {}, {});
                userEvent.click(
                    screen.getByRole('button', { name: /erweitert/i })
                );
                await waitFor(() => {
                    expect(
                        screen.getByRole('heading', { name: /erweitert/i })
                    ).toBeVisible();
                });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                userEvent.click(
                    screen.getByRole('button', { name: /erweitert/i })
                );
                await waitFor(() => {
                    expect(
                        screen.getByRole('heading', { name: /erweitert/i })
                    ).not.toBeVisible();
                });
            });

            it('should add category to filteroptions', async () => {
                const resultFn = jest.fn(() => ({
                    data: { results: [ComputerExperten] },
                }));
                const screen = render(
                    <SearchPage />,
                    {},
                    {
                        additionalMocks: [
                            {
                                request: {
                                    query: SearchQuery,
                                    variables: {
                                        searchText: 'Test',
                                        options: {
                                            categoryId: FaecherCategory.id,
                                        },
                                    },
                                },
                                result: resultFn,
                            },
                        ],
                    }
                );
                userEvent.click(
                    screen.getByRole('button', { name: /erweitert/i })
                );
                const combobox = screen.getByRole('combobox', {
                    name: /kategorie/i,
                });
                const faecherOption = await screen.findByRole('option', {
                    name: /fächer/i,
                });
                userEvent.selectOptions(combobox, faecherOption);
                userEvent.type(screen.getByLabelText('Suchbegriff'), 'Test');
                await waitFor(() => {
                    expect(resultFn).toHaveBeenCalled();
                });
            });
        });
    });
});
