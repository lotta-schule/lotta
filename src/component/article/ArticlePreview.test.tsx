import React from 'react';
import {
    render,
    cleanup,

} from 'test/util';
import { ArticlePreview } from './ArticlePreview';
import { UeberSuedamerika } from 'test/fixtures/Article';

afterEach(cleanup);

describe('component/article/ArticlePreview', () => {

    describe('Title', () => {
        it('should render a correct title', () => {
            const { container } = render(<ArticlePreview article={UeberSuedamerika} />);
            const title = container.querySelector('h5');
            expect(title).toHaveTextContent('Mein Artikel');
        });

        it('should have link if disableLink is not passed', () => {
            const { container } = render(<ArticlePreview article={UeberSuedamerika} />);
            const title = container.querySelector('h5');
            const titleLink = title!.querySelector('a');
            expect(titleLink).toBeDefined();
            expect(titleLink).toHaveAttribute('href', `/article/${UeberSuedamerika.id}`);
            expect(titleLink).toHaveTextContent('Mein Artikel');
        });

        it('should not have link if disableLink is passed true', () => {
            const { container } = render(<ArticlePreview article={UeberSuedamerika} disableLink />);
            const title = container.querySelector('h5');
            const titleLink = title!.querySelector('a');
            expect(titleLink).toBeNull();
        });
    });

    describe('Subtitle', () => {
        it('should show last updated', () => {
            const { container } = render(<ArticlePreview article={UeberSuedamerika} />);
            const subtitle = container.querySelector('h6');
            expect(subtitle).toHaveTextContent(/11\. Oktober 2019/);
        });

        it('should show topic', () => {
            const { container } = render(<ArticlePreview article={UeberSuedamerika} />);
            const subtitle = container.querySelector('h6');
            expect(subtitle).toHaveTextContent(/La Revolucion/);
        });
    });
});