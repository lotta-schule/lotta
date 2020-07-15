import React from 'react';
import { render, cleanup, waitFor } from 'test/util';
import { Klausurenplan, VivaLaRevolucion, MusikCategory, KeinErSieEsUser, SomeUser, imageFile } from 'test/fixtures';
import { ArticleModel } from 'model';
import { CategoryLayout } from './CategoryLayout';

afterEach(cleanup);

describe('component/article/CategoryLayout', () => {

    describe('Standard Category', () => {
        const articles = [Klausurenplan, VivaLaRevolucion]
            .map(partialArticle => ({ ...partialArticle, users: [KeinErSieEsUser, SomeUser], category: MusikCategory}) as ArticleModel);

        it('should render the category title', async done => {
            const { queryByText } = render(
                <CategoryLayout category={MusikCategory} articles={articles} />
            );
            await waitFor(() => {
                expect(queryByText('Musik')).toBeVisible();
            });
            done();
        });

        it('should render the category banner image', async done => {
            const category = { ...MusikCategory, bannerImageFile: imageFile };
            const { findByTestId } = render(
                <CategoryLayout category={category as any} articles={articles} />
            );
            const headerContent = await findByTestId('HeaderContent');
            expect(getComputedStyle(headerContent).backgroundImage).toContain('meinbild.jpg');
            done();
        });

        it('should render the widgets list', async done => {
            const { queryByTestId } = render(<CategoryLayout category={MusikCategory} articles={articles} />);
            await waitFor(() => {
                expect(queryByTestId('WidgetsList')).toBeVisible();
            });
            done();
        });

        it('should render an ArticlePreview', async done => {
            const { queryAllByTestId } = render(
                <CategoryLayout category={MusikCategory} articles={articles} />
            );
            await waitFor(() => {
                expect([...queryAllByTestId('ArticlePreviewDensedLayout'), ...queryAllByTestId('ArticlePreviewStandardLayout')]).toHaveLength(2);
            });
            done();
        });
    });

});
