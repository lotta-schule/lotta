import React from 'react';
import {
    render,
    cleanup,

} from 'test/util';
import { UeberSuedamerika, VivaLaRevolucion } from 'test/fixtures/Article';
import { CategoryLayout } from './CategoryLayout';
import { SuedAmerikaCategory } from 'test/fixtures/Tenant';

afterEach(cleanup);

describe('component/article/CategoryLayout', () => {

    describe('Standard Category', () => {
        it('should render the category title', async done => {
            const { container } = render(<CategoryLayout category={SuedAmerikaCategory} articles={[UeberSuedamerika, VivaLaRevolucion]} />);
            await new Promise(resolve => setTimeout(resolve));
            const title = container.querySelector('h2');
            expect(title).toHaveTextContent('Südamerika');
            done();
        });

        it('should render the widgets list', async done => {
            const { getByTestId } = render(<CategoryLayout category={SuedAmerikaCategory} articles={[UeberSuedamerika, VivaLaRevolucion]} />);
            await new Promise(resolve => setTimeout(resolve));
            getByTestId('WidgetsList');
            done();
        });

        it('should render an ArticlePreview', async done => {
            const { getAllByTestId } = render(<CategoryLayout category={SuedAmerikaCategory} articles={[UeberSuedamerika, VivaLaRevolucion]} />);
            await new Promise(resolve => setTimeout(resolve));
            getAllByTestId('ArticlePreview');
            done();
        });
    });

});