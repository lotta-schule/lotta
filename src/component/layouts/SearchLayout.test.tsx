import React from 'react';
import { render, waitFor } from 'test/util';
import { SearchQuery } from 'api/query/SearchQuery';
import { ComputerExperten, FaecherCategory } from 'test/fixtures';
import userEvent from '@testing-library/user-event';
import SearchLayout from './SearchLayout';

describe('component/layouts/SearchLayout', () => {
    describe('SearchLayout', () => {
        it('should render the search page', async () => {
            render(<SearchLayout />);
        });

        it('should have the correct title', () => {
            const screen = render(<SearchLayout />);
            expect(screen.container.querySelector('h2')).toHaveTextContent(
                'Suche'
            );
        });

        it('should issue a search request after typing', async () => {
            const screen = render(
                <SearchLayout />,
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
                const screen = render(<SearchLayout />, {}, {});
                userEvent.click(
                    screen.getByRole('button', { name: /erweitert/i })
                );
                await new Promise((resolve) => setTimeout(resolve, 500));
                await waitFor(() => {
                    expect(
                        screen.getByRole('heading', { name: /erweitert/i })
                            .parentElement
                    ).toBeVisible();
                });
                userEvent.click(
                    screen.getByRole('button', { name: /erweitert/i })
                );
                await new Promise((resolve) => setTimeout(resolve, 750));
                expect(
                    await screen.findByRole('heading', { name: /erweitert/i })
                ).not.toBeVisible();
            });

            it('should add category to filteroptions', async () => {
                const resultFn = jest.fn(() => ({
                    data: { results: [ComputerExperten] },
                }));
                const screen = render(
                    <SearchLayout />,
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
                userEvent.type(screen.getByLabelText('Suchbegriff'), 'Test');
                userEvent.click(
                    screen.getByRole('button', { name: /kategorie/i })
                );
                userEvent.click(
                    await screen.findByRole('option', { name: /fächer/i })
                );
                await waitFor(() => {
                    expect(resultFn).toHaveBeenCalled();
                });
            });
        });
    });
});
