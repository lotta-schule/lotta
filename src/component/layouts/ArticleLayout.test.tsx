import React from 'react';
import { render, cleanup, waitFor, getMetaTagValue } from 'test/util';
import { Schulfest, MusikCategory } from 'test/fixtures';
import { ArticleLayout } from './ArticleLayout';
import { GetTopicQuery } from 'api/query/GetTopicQuery';
import { GetArticleQuery } from 'api/query/GetArticleQuery';

afterEach(cleanup);

describe('component/article/ArticleLayout', () => {

    const testSetupOptions = {
        additionalMocks: [
            {
                request: { query: GetArticleQuery, variables: { id: Schulfest.id } },
                result: { data: { article: { ...Schulfest, category: MusikCategory } } }
            },
            {
                request: { query: GetTopicQuery, variables: { topic: "La Revolucion" } },
                result: { data: { articles: [] } }
            }
        ]
    };

    it('should show the correct title in the Browser header', async done => {
        const screen = render(
            <ArticleLayout articleId={Schulfest.id} />,
            { }, testSetupOptions
        );
        await screen.findByTestId('Article'); // wait until Article is loaded
        await waitFor(() => {
            expect(document.title).toContain('Schulfest');
            expect(getMetaTagValue('description')).toEqual('lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.');
            expect(getMetaTagValue('og:type')).toEqual('article');
        });
        done();
    });

    it('should not render the widgets list', async done => {
        const screen = render(
            <ArticleLayout articleId={Schulfest.id} />,
            { }, testSetupOptions
        );
        await screen.findByTestId('Article'); // wait until Article is loaded
        const sidebar = await screen.findByTestId('BaseLayoutSidebar');
        expect(sidebar).not.toBeNull();
        expect(sidebar).toHaveStyle({ width: 0 });
        done();
    });

});
