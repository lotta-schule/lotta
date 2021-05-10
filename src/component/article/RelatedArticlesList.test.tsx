import * as React from 'react';
import { render, waitFor } from 'test/util';
import {
    Weihnachtsmarkt,
    ComputerExperten,
    VivaLaRevolucion,
} from 'test/fixtures';
import { RelatedArticlesList } from './RelatedArticlesList';
import { GetArticlesForTag } from 'api/query/GetArticlesForTagQuery';
import { FetchResult } from '@apollo/client';
import { ArticleModel } from 'model';

describe('component/article/RelatedArticlesList', () => {
    const getAdditionalMocks = (
        result:
            | FetchResult<{ articles: ArticleModel[] }>
            | (() => FetchResult<{ articles: ArticleModel[] }>)
    ) => [
        {
            request: {
                query: GetArticlesForTag,
                variables: { tag: 'tag' },
            },
            result,
        },
    ];

    it('should render a RelatedArticlesList without error', () => {
        render(
            <RelatedArticlesList tag={'tag'} />,
            {},
            { additionalMocks: getAdditionalMocks({ data: { articles: [] } }) }
        );
    });

    describe('tag header', () => {
        it('should be visible when results are found', async () => {
            const screen = render(
                <RelatedArticlesList tag={'tag'} />,
                {},
                {
                    additionalMocks: getAdditionalMocks({
                        data: { articles: [Weihnachtsmarkt] },
                    }),
                }
            );
            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: /tag/ })
                ).toBeVisible();
            });
        });

        it('should not be shown when no results are found', async () => {
            const resFn = jest.fn(() => ({ data: { articles: [] } }));
            const screen = render(
                <RelatedArticlesList tag={'tag'} />,
                {},
                {
                    additionalMocks: getAdditionalMocks(resFn),
                }
            );
            await waitFor(() => {
                expect(resFn).toHaveBeenCalled();
            });
            expect(screen.queryByRole('heading', { name: /tag/i })).toBeNull();
        });
    });

    it('should render the articles found for a given tag', async () => {
        const resFn = jest.fn(() => ({
            data: {
                articles: [Weihnachtsmarkt, ComputerExperten, VivaLaRevolucion],
            },
        }));
        const screen = render(
            <RelatedArticlesList tag={'tag'} />,
            {},
            {
                additionalMocks: getAdditionalMocks(resFn),
            }
        );

        await waitFor(() => {
            expect(resFn).toHaveBeenCalled();
        });

        expect(
            screen.queryAllByTestId('ArticlePreviewDensedLayout')
        ).toHaveLength(3);
    });
});
