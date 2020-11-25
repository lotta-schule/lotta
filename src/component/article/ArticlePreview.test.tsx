import React from 'react';
import { render, cleanup } from 'test/util';
import { ComputerExperten } from 'test/fixtures';
import { ArticlePreview } from './ArticlePreview';

afterEach(cleanup);

describe('component/article/ArticlePreview', () => {

    it('should render an ArticlePreview in StandardLayout when no option is given', async () => {
        const { findByTestId } = render(
            <ArticlePreview article={ComputerExperten} />,
        );
        await findByTestId('ArticlePreviewStandardLayout');
    });

    it('should render an ArticlePreview in StandardLayout if \'standard\' layout is given', async () => {
        const { findByTestId } = render(
            <ArticlePreview article={ComputerExperten} layout={'standard'} />,
        );
        await findByTestId('ArticlePreviewStandardLayout');
    });

    it('should render an ArticlePreview in DensedLayout if \'densed\' layout is given', async () => {
        const { findByTestId } = render(
            <ArticlePreview article={ComputerExperten} layout={'densed'} />,
        );
        await findByTestId('ArticlePreviewDensedLayout');
    });

    it('should render an ArticlePreview in StandardLayout when \'2-columns\' layout is given', async () => {
        const { findByTestId } = render(
            <ArticlePreview article={ComputerExperten} layout={'2-columns'} />,
        );
        await findByTestId('ArticlePreviewStandardLayout');
    });
});
