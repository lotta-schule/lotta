import * as React from 'react';
import { render, waitFor, getMetaTagValue } from 'test/util';
import { Schulfest } from 'test/fixtures';
import { ArticleHead } from './ArticleHead';

describe('shared/article/ArticleLayout', () => {
    it('should show the correct title in the Browser header', async () => {
        render(<ArticleHead article={Schulfest} />);
        await waitFor(() => {
            expect(document.title).toContain('Schulfest');
            expect(getMetaTagValue('description')).toEqual(
                'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.'
            );
            expect(getMetaTagValue('og:type')).toEqual('article');
        });
    });

    it('show the correct url', async () => {
        render(<ArticleHead article={Schulfest} />);
        await waitFor(() => {
            expect(getMetaTagValue('og:url')).toEqual(
                'https://info.lotta.schule/a/3-Schulfest'
            );
        });
    });
});
