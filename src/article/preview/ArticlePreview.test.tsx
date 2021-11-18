import * as React from 'react';
import { render } from 'test/util';
import { ComputerExperten } from 'test/fixtures';
import { ArticlePreview } from './ArticlePreview';

describe('shared/article/ArticlePreview', () => {
    it('should render an ArticlePreview in StandardLayout when no option is given', () => {
        const screen = render(<ArticlePreview article={ComputerExperten} />);
        expect(
            screen.getByTestId('ArticlePreviewStandardLayout')
        ).toBeInTheDocument();
    });

    it("should render an ArticlePreview in StandardLayout if 'standard' layout is given", () => {
        const screen = render(
            <ArticlePreview article={ComputerExperten} layout={'standard'} />
        );
        expect(
            screen.getByTestId('ArticlePreviewStandardLayout')
        ).toBeInTheDocument();
    });

    it("should render an ArticlePreview in DensedLayout if 'densed' layout is given", () => {
        const screen = render(
            <ArticlePreview article={ComputerExperten} layout={'densed'} />
        );
        expect(
            screen.getByTestId('ArticlePreviewDensedLayout')
        ).toBeInTheDocument();
    });

    it("should render an ArticlePreview in StandardLayout when '2-columns' layout is given", () => {
        const screen = render(
            <ArticlePreview article={ComputerExperten} layout={'2-columns'} />
        );
        expect(
            screen.getByTestId('ArticlePreviewStandardLayout')
        ).toBeInTheDocument();
    });
});
