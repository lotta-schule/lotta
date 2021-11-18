import * as React from 'react';
import { render, waitFor, getMetaTagValue } from 'test/util';
import { Schulfest, MusikCategory } from 'test/fixtures';
import { ArticlePage } from './ArticlePage';

import GetArticleQuery from 'api/query/GetArticleQuery.graphql';
import GetArticlesForTag from 'api/query/GetArticlesForTagQuery.graphql';

describe('shared/article/ArticleLayout', () => {
    const testSetupOptions = {
        additionalMocks: [
            {
                request: {
                    query: GetArticleQuery,
                    variables: { id: Schulfest.id },
                },
                result: {
                    data: {
                        article: { ...Schulfest, category: MusikCategory },
                    },
                },
            },
            {
                request: {
                    query: GetArticlesForTag,
                    variables: { tag: 'La Revolucion' },
                },
                result: { data: { articles: [] } },
            },
        ],
    };

    it('should show the correct title in the Browser header', async () => {
        const screen = render(
            <ArticlePage article={Schulfest} />,
            {},
            testSetupOptions
        );
        await screen.findByTestId('Article'); // wait until Article is loaded
        await waitFor(() => {
            expect(document.title).toContain('Schulfest');
            expect(getMetaTagValue('description')).toEqual(
                'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.'
            );
            expect(getMetaTagValue('og:type')).toEqual('article');
        });
    });
});
