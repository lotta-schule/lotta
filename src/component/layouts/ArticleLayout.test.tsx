import React from 'react';
import { render, cleanup, waitFor, getMetaTagValue } from 'test/util';
import { Schulfest, MusikCategory } from 'test/fixtures';
import { ArticleLayout } from './ArticleLayout';
import { GetArticleQuery } from 'api/query/GetArticleQuery';

afterEach(cleanup);

describe('component/article/ArticleLayout', () => {

    const testSetupOptions = {
        additionalMocks: [
            {
                request: { query: GetArticleQuery, variables: { id: Schulfest.id } },
                result: { data: { article: { ...Schulfest, category: MusikCategory } } }
            }
        ]
    };

    it('should show the correct title in the Browser header', async done => {
        const { findByTestId } = render(
            <ArticleLayout articleId={Schulfest.id} />,
            { }, testSetupOptions
        );
        await findByTestId('Article'); // wait until Article is loaded
        await waitFor(() => {
            expect(document.title).toContain('Schulfest');
            expect(getMetaTagValue('description')).toEqual('lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.');
            expect(getMetaTagValue('og:type')).toEqual('article');
        });
        done();
    });

    it('should not render the widgets list', async done => {
        const { findByTestId, queryByTestId } = render(
            <ArticleLayout articleId={Schulfest.id} />,
            { }, testSetupOptions
        );
        await findByTestId('Article'); // wait until Article is loaded
        const sidebar = queryByTestId('BaseLayoutSidebar');
        expect(sidebar).not.toBeNull();
        expect(sidebar).toHaveStyle({ width: 0 });
        done();
    });

});
