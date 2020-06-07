import React from 'react';
import { render, cleanup, waitFor } from 'test/util';
import { Klausurenplan, VivaLaRevolucion, MusikCategory, KeinErSieEsUser, SomeUser } from 'test/fixtures';
import { ArticleModel } from 'model';
import { CategoryLayout } from './CategoryLayout';

afterEach(cleanup);

describe('component/article/CategoryLayout', () => {

    describe('Standard Category', () => {
        const articles = [Klausurenplan, VivaLaRevolucion]
            .map(partialArticle => ({ ...partialArticle, users: [KeinErSieEsUser, SomeUser], category: MusikCategory}) as ArticleModel);

        it('should render the category title', async done => {
            const { queryByText } = render(<CategoryLayout category={MusikCategory} articles={articles} />);
            await waitFor(() => {
                expect(queryByText('Musik')).not.toBeNull();
            });
            done();
        });

        it('should render the widgets list', async done => {
            const { queryByTestId } = render(<CategoryLayout category={MusikCategory} articles={articles} />);
            await waitFor(() => {
                expect(queryByTestId('WidgetsList')).not.toBeNull();
            });
            done();
        });

        it('should render an ArticlePreview', async done => {
            const { queryAllByTestId } = render(<CategoryLayout category={MusikCategory} articles={articles} />);
            await waitFor(() => {
                expect([...queryAllByTestId('ArticlePreviewDensedLayout'), ...queryAllByTestId('ArticlePreviewStandardLayout')]).toHaveLength(2);
            });
            done();
        });
    });

});
